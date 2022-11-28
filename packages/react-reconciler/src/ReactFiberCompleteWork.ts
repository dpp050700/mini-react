import {HostText, HostComponent, HostRoot, FunctionComponent} from './ReactWorkTags'
import {
  createTextInstance,
  createInstance,
  appendInitialChild,
  finalizeInitialChildren,
  prepareUpdate
} from 'react-dom-bindings/src/client/ReactDOMHostConfig'
import {NoFlags, Update} from './ReactFiberFlags'

/**
 * 把当前完成的 fiber 所有的子节点对应的真实 DOM 都挂载到自己父parent真实DOM节点上
 * @param parent
 * @param workInProgress
 */
function appendAllChildren(parent: any, workInProgress: any) {
  let node = workInProgress.child
  while (node) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode)
      // 如果第一个儿子不是原生节点，说明它可能是一个函数组件
    } else if (node.child !== null) {
      node = node.child
      continue
    }
    if (node === workInProgress) {
      return
    }
    // 如果当前节点没有弟弟
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        break
      }
      node = node.return
    }
    // appendInitialChild(parent, node.stateNode)
    node = node.sibling
  }
}

function markUpdate(workInProgress:any){
  workInProgress.flags |= Update
}

function updateHostComponent(current: any, workInProgress:any, type: any, newProps:any){
  const oldProps = current.memoizedProps
  const instance = workInProgress.stateNode
  const updatePayload = prepareUpdate(instance, type, oldProps, newProps)
  workInProgress.updateQueue = updatePayload
  if(updatePayload) {
    markUpdate(workInProgress)
  }
}

/**
 * 完成一个fiber 节点
 * @param current 老 fiber
 * @param workInProgress 新的构建的 fiber
 */
function completeWork(current: any, workInProgress: any) {
  const newProps = workInProgress.pendingProps
  switch (workInProgress.tag) {
    case HostRoot:
      bubbleProperties(workInProgress)
      break
    case HostComponent:
      const { type } = workInProgress
      // 如果老 fiber 存在，并且老fiber 上有 真实 dom，走更新逻辑
      if(current !== null && workInProgress.stateNode !== null) {
        updateHostComponent(current, workInProgress, type, newProps)
      }else {
        const instance = createInstance(type, newProps, workInProgress)
        // 把自己所有的儿子都添加到自己的身上
        workInProgress.stateNode = instance
        appendAllChildren(instance, workInProgress)
        finalizeInitialChildren(instance, type, newProps)
      }

      bubbleProperties(workInProgress)
      break
    case FunctionComponent:
      bubbleProperties(workInProgress)
      break
    case HostText:
      const newText = newProps
      // 创建真实的DOM 节点
      workInProgress.stateNode = createTextInstance(newText)
      // 向上冒泡属性
      bubbleProperties(workInProgress)
      break

    default:
      break
  }
}

function bubbleProperties(completedWork: any) {
  let subtreeFlags = NoFlags
  // 遍历当前 fiber 的所有子节点，把所有的子节点的副作用，以及子节点的子节点的副作用全部合并起来
  let child = completedWork.child
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags
    subtreeFlags |= child.flags
    child = child.sibling
  }
  completedWork.subtreeFlags = subtreeFlags
}

export { completeWork }
