import { HostRoot, HostComponent, HostText, IndeterminateComponent, FunctionComponent } from './ReactWorkTags'
import { processUpdateQueue } from './ReactFiberClassUpdateQueue'
import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber'
import { shouldSetTextContent } from 'react-dom-bindings/src/client/ReactDOMHostConfig'
import { renderWithHooks } from './ReactFiberHooks'

/**
 * 根据新的虚拟 DOM 生成新的fiber 链表
 * @param current
 * @param workInProgress 新的 fiber
 * @param nextChildren 新的虚拟 DOM
 */
function reconcileChildren(current: any, workInProgress: any, nextChildren: any) {
  // 如果没有老 fiber， 说明此新fiber 是新创建的
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    // 如果有老 fiber 的话，需要做 dom-diff
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren)
  }
}

function updateHostRoot(current: any, workInProgress: any) {
  // 需要知道它的子虚拟 DOM，知道她的儿子的虚拟 DOM 信息
  processUpdateQueue(workInProgress) // workInProgress.memoizedState = {element}
  const nextState = workInProgress.memoizedState
  // nextChildren 就是新的虚拟 DOM
  const nextChildren = nextState.element
  // 根据 新的虚拟 DOM 生成 子 Fiber 链表
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

/**
 * 构建原生组件的子 fiber 链表
 * @param current 老 fiber
 * @param workInProgress 新fiber
 */
function updateHostComponent(current: any, workInProgress: any) {
  const { type } = workInProgress
  const nextProps = workInProgress.pendingProps
  let nextChildren = nextProps.children
  // 判断当前虚拟 DOM 它的儿子是不是一个文本独生子
  const isDirectTextChildren = shouldSetTextContent(type, nextProps)
  if (isDirectTextChildren) {
    nextChildren = null
  }
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

function updateHostText(current: any, workInProgress: any): null {
  return null
}

function mountIndeterminateComponent(current: any, workInProgress: any, Component: any) {
  const props = workInProgress.pendingProps
  // const value = Component(props)
  const value = renderWithHooks(current, workInProgress, Component, props)
  workInProgress.tag = FunctionComponent
  reconcileChildren(current, workInProgress, value)
  return workInProgress.child
}

function updateFunctionComponent(current: any, workInProgress: any, Component: any, nextProps: any){
  const nextChildren = renderWithHooks(current, workInProgress, Component, nextProps)
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

/**
 * 目标是根据新虚拟 dom 构建新的 fiber 子链表 child .sibling
 * @param current 老 fiber
 * @param workInProgress 新的 fiber
 */
function beginWork(current: any, workInProgress: any) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case FunctionComponent:
      const Component = workInProgress.type
      const nextProps = workInProgress.pendingProps
      return updateFunctionComponent(current,workInProgress, Component, nextProps)
    case IndeterminateComponent:
      return mountIndeterminateComponent(current, workInProgress, workInProgress.type)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      return updateHostText(current, workInProgress)
    default:
      return null
  }
}

export { beginWork }
