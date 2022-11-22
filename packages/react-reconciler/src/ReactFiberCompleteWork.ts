import { NoFlags } from './ReactFiberFlags'
import { HostComponent, HostRoot, HostText } from './ReactWorkTags'
import { FiberNode } from './ReactFiber'
import {
  createTextInstance,
  createInstance,
  appendInitialChild,
  finalizeInitialChildren
} from 'react-dom-bindings/src/client/ReactDOMHostConfig'

function appendAllChildren(parent: Element, workInProgress: FiberNode) {
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
    node = node.sibling
  }
}

export function completeWork(current: FiberNode, workInProgress: FiberNode) {
  const newProps = workInProgress.pendingProps
  switch (workInProgress.tag) {
    case HostRoot:
      bubbleProperties(workInProgress)
      break
    case HostComponent: {
      const { type } = workInProgress
      const instance = createInstance(type, newProps, workInProgress)
      workInProgress.stateNode = instance
      appendAllChildren(instance, workInProgress)
      finalizeInitialChildren(instance, type, newProps)
      bubbleProperties(workInProgress)
      break
    }
    case HostText: {
      const newText = newProps
      // 创建真实的DOM 节点
      workInProgress.stateNode = createTextInstance(newText)
      bubbleProperties(workInProgress)
      break
    }
    default:
      break
  }
}

function bubbleProperties(completedWork: any) {
  let subtreeFlags = NoFlags
  // 遍历当前 fiber 的所有子节点，把所有的子节点的副作用全部合并起来
  let child = completedWork.child
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags
    subtreeFlags |= child.flags
    child = child.sibling
  }
  completedWork.subtreeFlags = subtreeFlags
}
