import assign from 'shared/assign'
import { markUpdateLaneFromFiberToRoot } from './ReactFiberConcurrentUpdates'

export const UpdateState = 0

export function initializeUpdateQueue(fiber: any) {
  // 创建一个新的更新队列
  const queue: any = {
    shared: {
      pending: null
    }
  }
  fiber.updateQueue = queue
}

export function createUpdate() {
  const update: any = {
    tag: UpdateState
  }
  return update
}

export function enqueueUpdate(fiber: any, update: any) {
  const updateQueue = fiber.updateQueue
  const pending = updateQueue.shared.pending
  if (pending === null) {
    update.next = update
  } else {
    update.next = pending.next
    pending.next = update
  }
  // pending 指向最后一个更新，最后一个更新的 next 指向第一个更新
  updateQueue.shared.pending = update
  // 返回根节点 从当前的 fiber 一直到根节点
  return markUpdateLaneFromFiberToRoot(fiber)
}

/**
 * 根据老状态和更新队列中的更新 计算最新的状态
 * @param workInProgress
 */
export function processUpdateQueue(workInProgress: any) {
  const queue = workInProgress.updateQueue
  const pendingQueue = queue.shared.pending
  // 如果有更新
  if (pendingQueue !== null) {
    queue.shared.pending = null
    const lastPendingUpdate = pendingQueue
    const firstPendingUpdate = lastPendingUpdate.next
    // 把循环链表剪开
    lastPendingUpdate.next = null

    let newState = workInProgress.memoizedState
    let update = firstPendingUpdate
    while (update) {
      newState = getStateFromUpdate(update, newState)
      update = update.next
    }
    console.log(newState)
    workInProgress.memoizedState = newState
  }
}

/**
 * 根据老状态和更新计算新的状态
 * @param update
 * @param prevState
 */
function getStateFromUpdate(update: any, prevState: any) {
  switch (update.tag) {
    case UpdateState:
      const { payload } = update
      return assign({}, prevState, payload)
      break

    default:
      break
  }
}
