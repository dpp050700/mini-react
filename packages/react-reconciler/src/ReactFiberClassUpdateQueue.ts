import { markUpdateLaneFromFiberToRoot } from './ReactFiberConcurrentUpdates'

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
  const update: any = {}
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
