import { FiberNode } from './ReactFiber'
import { HostComponent, HostRoot, HostText } from './ReactWorkTags'
import { processUpdateQueue } from './ReactFiberClassUpdateQueue'
import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber'
import { ReactElement } from 'shared/ReactTypes'
import { shouldSetTextContent } from 'react-dom-bindings/src/client/ReactDOMHostConfig'

function reconcileChildren(
  current: FiberNode,
  workInProgress: FiberNode,
  nextChildren: ReactElement | ReactElement[]
) {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    )
  }
}

function updateHostRoot(current: FiberNode, workInProgress: FiberNode) {
  processUpdateQueue(workInProgress)

  const nextState = workInProgress.memoizedState

  const nextChildren = nextState.element

  reconcileChildren(current, workInProgress, nextChildren)

  return workInProgress.child
}

function updateHostComponent(current: FiberNode, workInProgress: FiberNode) {
  const { type } = workInProgress
  const nextProps = workInProgress.pendingProps
  let nextChildren = nextProps.children

  const isDirectTextChildren = shouldSetTextContent(type, nextProps)
  if (isDirectTextChildren) {
    nextChildren = null
  }
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

function updateHostText(): null {
  return null
}

export function beginWork(current: FiberNode, workInProgress: FiberNode) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      return updateHostText()
    default:
      return null
  }
}
