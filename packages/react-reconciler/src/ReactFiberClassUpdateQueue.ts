import { FiberNode } from './ReactFiber'
import { markUpdateLaneFromFiberToRoot } from './ReactFiberConcurrentUpdates'
import assign from 'shared/assign'

export const UpdateState = 0
export const ReplaceState = 1
export const ForceUpdate = 2
export const CaptureUpdate = 3

export type Tag =
  | typeof UpdateState
  | typeof ReplaceState
  | typeof ForceUpdate
  | typeof CaptureUpdate

export interface Update {
  payload: any
  next: Update | null
  tag: Tag
}

export interface UpdateQueue {
  shared: {
    pending: Update | null
  }
}

export function initializeUpdateQueue(fiber: FiberNode) {
  const queue: UpdateQueue = {
    shared: {
      pending: null
    }
  }
  fiber.updateQueue = queue
}

export function createUpdate() {
  const update: Update = {
    tag: UpdateState,
    payload: null,
    next: null
  }
  return update
}

export function enqueueUpdate(fiber: FiberNode, update: Update) {
  const updateQueue = fiber.updateQueue
  const pending = updateQueue.shared.pending

  if (pending === null) {
    update.next = update
  } else {
    update.next = pending.next
    pending.next = update
  }
  updateQueue.shared.pending = update
  return markUpdateLaneFromFiberToRoot(fiber)
}

export function processUpdateQueue(workInProgress: FiberNode) {
  const queue = workInProgress.updateQueue
  const pendingQueue = queue.shared.pending
  if (pendingQueue !== null) {
    queue.shared.pending = null
    const lastPendingUpdate = pendingQueue
    const firstPendingQueue = lastPendingUpdate.next
    lastPendingUpdate.next = null

    let newState = workInProgress.memoizedState
    let update = firstPendingQueue
    while (update) {
      newState = getStateFromUpdate(update, newState)
      update = update.next
    }
    workInProgress.memoizedState = newState
  }
}

function getStateFromUpdate(update: Update, prevState: any) {
  switch (update.tag) {
    case UpdateState: {
      const { payload } = update
      return assign({}, prevState, payload)
    }

    default:
      break
  }
}
