import ReactSharedInternals from 'shared/ReactSharedInternals'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import { enqueueConcurrentHookUpdate } from './ReactFiberConcurrentUpdates'
import { Passive as PassiveEffect } from './ReactFiberFlags'
import { HasEffect as HookHasEffect, Passive as HookPassive } from './ReactHookEffectTags'

const { ReactCurrentDispatcher } = ReactSharedInternals

let currentlyRenderingFiber: any = null

let workInProgressHook: any = null

let currentHook: any = null

const HooksDispatcherOnMount = {
  useReducer: mountReducer,
  useState: mountState,
  useEffect: mountEffect
}

const HooksDispatcherOnUpdate = {
  useReducer: updateReducer,
  useState: updateState,
  useEffect: updateEffect
}

function baseStateReducer(state: any, action: any) {
  return typeof action === 'function' ? action(state) : action
}

function mountState(initialState: any) {
  const hook = mountWorkInProgressHook()
  hook.memoizedState = initialState
  const queue: any = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: baseStateReducer, // 上一个 reducer
    lastRenderedState: initialState // 上一个 state
  }
  hook.queue = queue

  const dispatch = (queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue))
  return [hook.memoizedState, dispatch]
}

function updateState(initialState: any) {
  return updateReducer(baseStateReducer, initialState)
}

function updateReducer(reducer: any, initialArg: any) {
  const hook = updateWorkInProgressHook()
  const queue = hook.queue
  const current = currentHook

  const pendingQueue = queue.pending

  let newState = current.memoizedState

  if (pendingQueue !== null) {
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

function mountReducer(reducer: any, initialArg: any) {
  const hook = mountWorkInProgressHook()
  hook.memoizedState = initialArg
  const queue: any = {
    pending: null,
    dispatch: null
  }
  hook.queue = queue
  const dispatch = (queue.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, queue))
  return [hook.memoizedState, dispatch]
}

function mountEffect(create: any, deps: []) {
  return mountEffectImpl(PassiveEffect, HookPassive, create, deps)
}

function mountEffectImpl(fiberFlags: any, hookFlags: any, create: any, deps: any) {
  const hook = mountWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps
  // 给当前的函数组件fiber 添加 flags
  currentlyRenderingFiber.flags |= fiberFlags
  hook.memoizedState = pushEffect(HookHasEffect | hookFlags, create, undefined, nextDeps)
}

function pushEffect(tag: any, create: any, destroy: any, deps: any) {
  const effect: any = {
    tag,
    create,
    destroy,
    deps,
    next: null
  }
  let componentUpdateQueue = currentlyRenderingFiber.updateQueue
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue()
    currentlyRenderingFiber.updateQueue = componentUpdateQueue
    componentUpdateQueue.lastEffect = effect.next = effect
  } else {
    const lastEffect = componentUpdateQueue.lastEffect
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect
    } else {
      const firstEffect = lastEffect.next
      lastEffect.next = effect
      effect.next = firstEffect
      componentUpdateQueue.lastEffect = effect
    }
  }
  return effect
}

function createFunctionComponentUpdateQueue(): any {
  return {
    lastEffect: null
  }
}

function updateEffect(create: any, deps: any) {
  return updateEffectImpl(PassiveEffect, HookPassive, create, deps)
}

function updateEffectImpl(fiberFlags: any, hookFlags: any, create: any, deps: any) {
  const hook = updateWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps
  let destroy
  if (currentHook !== null) {
    // 获取此 useEffect 这个 hook 上老的 effect 对象
    const prevEffect = currentHook.memoizedState
    destroy = prevEffect.destroy
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps
      // 用新数组和老数组进行对比，如果一样的话
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 不管要不要重新执行，都需要把新的effect 组成完整的循环链表放到 fiber.updateQueue 中
        hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps)
        return
      }
    }
  }
  // 如果要执行的话需要修改 fiber 的 flags
  currentlyRenderingFiber.flags |= fiberFlags
  // 如果要执行的话，添加 HookHasEffect
  hook.memoizedState = pushEffect(HookHasEffect | hookFlags, create, destroy, nextDeps)
}

function areHookInputsEqual(nextDeps: any, prevDeps: any) {
  if (prevDeps === null) {
    return null
  }
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue
    }
    return false
  }
  return true
}

/**
 * 执行派发动作， 更新状态、并且页面更新
 * @param fiber
 * @param queue
 * @param action
 */
function dispatchReducerAction(fiber: any, queue: any, action: any) {
  const update: any = {
    action,
    next: null
  }
  const root = enqueueConcurrentHookUpdate(fiber, queue, update)
  scheduleUpdateOnFiber(root)
  // console.log(fiber, queue, action)
}

function dispatchSetState(fiber: any, queue: any, action: any) {
  const update: any = {
    action,
    hasEagerState: false, // 是否有急切的更新
    eagerState: null, // 急切的更新状态
    next: null
  }
  const { lastRenderedReducer, lastRenderedState } = queue
  const eagerState = lastRenderedReducer(lastRenderedState, action)
  update.hasEagerState = true
  update.eagerState = eagerState
  if (Object.is(eagerState, lastRenderedState)) {
    return
  }
  const root = enqueueConcurrentHookUpdate(fiber, queue, update)
  scheduleUpdateOnFiber(root)
}

function updateWorkInProgressHook() {
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate
    currentHook = current.memoizedState
  } else {
    currentHook = currentHook.next
  }
  const newHook: any = {
    memoizedState: currentHook.memoizedState,
    queue: currentHook.queue,
    next: null
  }
  if (workInProgressHook === null) {
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
  const hook: any = {
    memoizedState: null,
    queue: null, // 存放本 hook 的更新队列
    next: null // 指向下一个 hook
  }
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    workInProgressHook.next = hook
    workInProgressHook = hook
  }
  return workInProgressHook
}

export function renderWithHooks(current: any, workInProgress: any, Component: any, props: any) {
  currentlyRenderingFiber = workInProgress
  workInProgress.updateQueue = null

  // 有老的 fiber 并且有老的 hook 链表
  if (current !== null && current.memoizedState !== null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate
  } else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMount
  }

  // 需要在函数组件执行前 给 ReactCurrentDispatcher.current 赋值

  const children = Component(props)
  currentlyRenderingFiber = null
  workInProgress = null
  return children
}
