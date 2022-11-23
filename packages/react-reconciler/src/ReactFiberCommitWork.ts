import { MutationMask, Placement } from './ReactFiberFlags'
import { HostRoot, HostComponent, HostText, FunctionComponent } from './ReactWorkTags'
import { appendChild, insertBefore } from 'react-dom-bindings/src/client/ReactDOMHostConfig'

function recursivelyTraverseMutationEffects(root: any, parentFiber: any) {
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
  switch (finishedWork.tag) {
    case FunctionComponent:
    case HostRoot:
    case HostComponent:
    case HostText:
      // 先便利他么的子节点，处理它们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork)
      // 处理自己身上的副作用
      commitReconciliationEffects(finishedWork)
      break
    default:
      break
  }
}

function commitWork() {}

export { commitWork }
