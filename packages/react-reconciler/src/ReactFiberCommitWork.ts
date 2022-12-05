import { MutationMask, Passive, Placement, Update } from './ReactFiberFlags'
import { HostRoot, HostComponent, HostText, FunctionComponent } from './ReactWorkTags'
import { appendChild, insertBefore, commitUpdate, removeChild } from 'react-dom-bindings/src/client/ReactDOMHostConfig'
import { HasEffect as HookHasEffect, Passive as HookPassive } from './ReactHookEffectTags'

let hostParent: any = null

function commitDeletionEffects(root: any, returnFiber: any, deletedFiber: any) {
  let parent = returnFiber
  // 一直向上查找，找到真实 dom 节点
  findParent: while (parent !== null) {
    switch (parent.tag) {
      case HostComponent: {
        hostParent = parent.stateNode
        break findParent
      }
      case HostRoot: {
        hostParent = parent.stateNode.containerInfo
        break findParent
      }
    }
    parent = parent.return
  }
  commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber)
  hostParent = null
}

/**
 *
 * @param finishedRoot
 * @param nearestMountedAncestor 最近的挂载的祖先
 * @param deletedFiber
 */
function commitDeletionEffectsOnFiber(finishedRoot: any, nearestMountedAncestor: any, deletedFiber: any) {
  switch (deletedFiber.tag) {
    case HostComponent:
    case HostText: {
      // 当要删除一个节点的时候，要先删除他的子节点
      // TODO Why？ 自己删掉了，子节点不也就删掉了？？？
      // 不直接删除自己，是因为还需要处理其他事情！ 类似：生命周期函数执行
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber)
      if (hostParent !== null) {
        removeChild(hostParent, deletedFiber.stateNode)
      }
      break
    }
    default:
      break
  }
}

function recursivelyTraverseDeletionEffects(finishedRoot: any, nearestMountedAncestor: any, parent: any) {
  let child = parent.child
  while (child !== null) {
    commitDeletionEffects(finishedRoot, nearestMountedAncestor, child)
    child = child.sibling
  }
}

/**
 * 递归遍历处理变更的副作用
 * @param root
 * @param parentFiber
 */
function recursivelyTraverseMutationEffects(root: any, parentFiber: any) {
  const deletions = parentFiber.deletions
  if (deletions !== null) {
    for (let i = 0; i < deletions.length; i++) {
      const childToDelete = deletions[i]
      commitDeletionEffects(root, parentFiber, childToDelete)
    }
  }

  if (parentFiber.subtreeFlags & MutationMask) {
    let { child } = parentFiber
    while (child !== null) {
      commitMutationEffectsOnFiber(child, root)
      child = child.sibling
    }
  }
}

function commitReconciliationEffects(finishedWork: any) {
  const { flags } = finishedWork
  // 如果此 fiber 要进行插入操作
  if (flags & Placement) {
    // 进行插入操作。把fiber 对应的真实DOM节点添加到真实的 dom 节点上
    commitPlacement(finishedWork)
    finishedWork.flags &= ~Placement
  }
}

function isHostParent(fiber: any) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot
}

function getHostParentFiber(fiber: any) {
  let parent = fiber.return
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent
    }
    parent = parent.return
  }
}

function insertOrAppendPlacementNode(node: any, before: any, parent: any) {
  const { tag } = node
  const isHost = tag === HostComponent || tag === HostText
  if (isHost) {
    const { stateNode } = node
    if (before) {
      insertBefore(parent, stateNode, before)
    } else {
      appendChild(parent, stateNode)
    }
  } else {
    const { child } = node
    if (child !== null) {
      insertOrAppendPlacementNode(child, before, parent)
      let { sibling } = child
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent)
        sibling = sibling.sibling
      }
    }
  }
}

/**
 * 查找自己的弟弟
 * @param fiber
 */
function getHostSibling(fiber: any): any {
  let node = fiber
  siblings: while (true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        return null
      }
      node = node.return
    }
    node = node.sibling
    while (node.tag !== HostComponent && node.tag !== HostText) {
      if (node.flags & Placement) {
        continue siblings
      } else {
        node = node.child
      }
    }

    if (!(node.flags & Placement)) {
      return node.stateNode
    }
  }
}

function commitPlacement(finishedWork: any) {
  let parentFiber = getHostParentFiber(finishedWork)
  switch (parentFiber.tag) {
    case HostRoot: {
      const parent = parentFiber.stateNode.containerInfo
      const before = getHostSibling(finishedWork) // 获取最近的弟弟真实 dom 节点
      insertOrAppendPlacementNode(finishedWork, before, parent)
      break
    }
    case HostComponent: {
      const parent = parentFiber.stateNode
      const before = getHostSibling(finishedWork) // 获取最近的弟弟真实 dom 节点
      insertOrAppendPlacementNode(finishedWork, before, parent)
      break
    }

    default:
      break
  }
  // parentFiber.stateNode.appendChild(finishedWork.stateNode)
}

export function commitMutationEffectsOnFiber(finishedWork: any, root: any) {
  const current = finishedWork.alternate
  const flags = finishedWork.flags
  switch (finishedWork.tag) {
    case FunctionComponent:
    case HostRoot:
    case HostText:
      // 先便利他么的子节点，处理它们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork)
      // 处理自己身上的副作用
      commitReconciliationEffects(finishedWork)
      break
    case HostComponent:
      recursivelyTraverseMutationEffects(root, finishedWork)
      // 处理自己身上的副作用
      commitReconciliationEffects(finishedWork)
      if (flags & Update) {
        const instance = finishedWork.stateNode
        // 更新真实dom
        if (instance !== null) {
          const newProps = finishedWork.memoizedProps
          const oldProps = current !== null ? current.memoizedProps : newProps
          const type = finishedWork.type
          const updatePayload = finishedWork.updateQueue
          finishedWork.updateQueue = null
          if (updatePayload) {
            commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork)
          }
        }
      }

    default:
      break
  }
}

export function commitPassiveUnmountEffects(finishedWork: any) {
  commitPassiveUnmountOnFiber(finishedWork)
}
export function commitPassiveMountEffects(root: any, finishedWork: any) {
  commitPassiveMountOnFiber(root, finishedWork)
}

function commitPassiveUnmountOnFiber(finishedWork: any) {
  const flags = finishedWork.flags
  switch (finishedWork.tag) {
    case HostRoot: {
      recursivelyTraversePassiveUnMountEffects(finishedWork)
      break
    }
    case FunctionComponent: {
      recursivelyTraversePassiveUnMountEffects(finishedWork)
      if (flags & Passive) {
        commitHookPassiveUnMountEffects(finishedWork, HookHasEffect | HookPassive)
      }
      break
    }
  }
}

function recursivelyTraversePassiveUnMountEffects(parentFiber: any) {
  if (parentFiber.subtreeFlags & Passive) {
    let child = parentFiber.child
    while (child !== null) {
      commitPassiveUnmountOnFiber(child)
      child = child.sibling
    }
  }
}

function commitHookPassiveUnMountEffects(finishedWork: any, hookFlags: any) {
  commitHookEffectListUnMount(hookFlags, finishedWork)
}

function commitHookEffectListUnMount(flags: any, finishedWork: any) {
  const updateQueue = finishedWork.updateQueue
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next
    let effect = firstEffect
    do {
      if ((effect.tag & flags) === flags) {
        const destroy = effect.destroy
        if (destroy !== undefined) {
          destroy()
        }
      }
      effect = effect.next
    } while (effect !== firstEffect)
  }
}

function commitPassiveMountOnFiber(finishedRoot: any, finishedWork: any) {
  const flags = finishedWork.flags
  switch (finishedWork.tag) {
    case HostRoot: {
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork)
      break
    }
    case FunctionComponent: {
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork)
      if (flags & Passive) {
        commitHookPassiveMountEffects(finishedWork, HookPassive | HookHasEffect)
      }
      break
    }
  }
}

function recursivelyTraversePassiveMountEffects(root: any, parentFiber: any) {
  if (parentFiber.subtreeFlags & Passive) {
    let child = parentFiber.child
    while (child !== null) {
      commitPassiveMountOnFiber(root, child)
      child = child.sibling
    }
  }
}

function commitHookPassiveMountEffects(finishedWork: any, hookFlags: any) {
  commitHookEffectListMount(hookFlags, finishedWork)
}

function commitHookEffectListMount(flags: any, finishedWork: any) {
  const updateQueue = finishedWork.updateQueue
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next
    let effect = firstEffect
    do {
      if ((effect.tag & flags) === flags) {
        const create = effect.create
        effect.destroy = create()
      }
      effect = effect.next
    } while (effect !== firstEffect)
  }
}

function commitWork() {}

export { commitWork }
