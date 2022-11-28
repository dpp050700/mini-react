import ReactSharedInternals from 'shared/ReactSharedInternals'
import {scheduleUpdateOnFiber} from "./ReactFiberWorkLoop";
import {enqueueConcurrentHookUpdate} from './ReactFiberConcurrentUpdates'

const { ReactCurrentDispatcher } = ReactSharedInternals

let currentlyRenderingFiber:any = null

let workInProgressHook:any = null

let currentHook:any = null

const HooksDispatcherOnMount = {
  useReducer: mountReducer
}

const HooksDispatcherOnUpdate = {
  useReducer: updateReducer
}

function updateReducer(reducer: any){
  const hook = updateWorkInProgress()
  const queue = hook.queue
  const current = currentHook

  const pendingQueue = queue.pending

  let newState = current.memoizedState

  if(pendingQueue !== null) {
    queue.pending = null
    const firstUpdate = pendingQueue.next
    let update = firstUpdate
    do {
      const action = update.action
      newState = reducer(newState, action)
      update = update.next
    } while (update !== null && update !== firstUpdate)
  }
  hook.memoizedState = newState

  return [hook.memoizedState, queue.dispatch]
}

function mountReducer(reducer: any, initialArg: any){
  const hook = mountWorkInProgressHook()
  hook.memoizedState = initialArg
  const queue:any = {
    pending: null,
    dispatch: null
  }
  hook.queue = queue
  const dispatch = (queue.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, queue))
  return [hook.memoizedState, dispatch]
}

/**
 * 执行派发动作， 更新状态、并且页面更新
 * @param fiber
 * @param queue
 * @param action
 */
function dispatchReducerAction(fiber:any, queue:any, action:any){
  const update:any = {
    action,
    next: null
  }
  const root = enqueueConcurrentHookUpdate(fiber, queue, update)
  scheduleUpdateOnFiber(root)
  // console.log(fiber, queue, action)
}

function updateWorkInProgress(){
  if(currentHook ===null) {
    const current = currentlyRenderingFiber.alternate
    currentHook = current.memoizedState
  } else {
    currentHook = currentHook.next
  }
  const newHook:any = {
    memoizedState:currentHook.memoizedState,
    queue: currentHook.queue,
    next: null
  }
  if(workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook
  } else {
    workInProgressHook = workInProgressHook.next = newHook
  }
  return workInProgressHook
}

/**
 * 挂载构建中的 hook
 */
function mountWorkInProgressHook() {
  const hook:any = {
    memoizedState:null,
    queue: null, // 存放本 hook 的更新队列
    next: null // 指向下一个 hook
  }
  if(workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  }else {
    workInProgressHook.next = hook
    workInProgressHook = hook
  }
  return workInProgressHook
}


export function renderWithHooks(current: any, workInProgress: any, Component: any, props: any) {

  currentlyRenderingFiber = workInProgress

  // 有老的 fiber 并且有老的 hook 链表
  if(current !== null && current.memoizedState !== null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate
  }else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMount
  }

  // 需要在函数组件执行前 给 ReactCurrentDispatcher.current 赋值

  const children = Component(props)
  currentlyRenderingFiber = null
  workInProgress = null
  return children
}
