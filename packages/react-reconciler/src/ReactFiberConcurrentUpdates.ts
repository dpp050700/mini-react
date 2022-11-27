import { HostRoot } from './ReactWorkTags'

const concurrentQueue:any = []
let concurrentQueuesIndex = 0

export function markUpdateLaneFromFiberToRoot(sourceFiber: any) {
  let node = sourceFiber
  let parent = sourceFiber.return
  while (parent !== null) {
    node = parent
    parent = parent.return
  }
  if (node.tag === HostRoot) {
    return node.stateNode
  }
  return null
}

export function enqueueConcurrentHookUpdate(fiber:any, queue:any, update:any){
  enqueueUpdate(fiber,queue,update)
  return getRootForUpdateFiber(fiber)
}

function getRootForUpdateFiber(sourceFiber:any){
  let node = sourceFiber
  let parent = node.return
  while (parent !== null) {
    node = parent
    parent = node.return
  }

  return node.tag === HostRoot ? node.stateNode : null
}

//把更新先缓存到数组里面
function enqueueUpdate(fiber:any, queue:any, update:any) {
  concurrentQueue[concurrentQueuesIndex++] = fiber
  concurrentQueue[concurrentQueuesIndex++] = queue
  concurrentQueue[concurrentQueuesIndex++] = update
}

export function finishQueueingConcurrentUpdates() {
  const endIndex = concurrentQueuesIndex
  concurrentQueuesIndex = 0
  let i = 0
  while (i < endIndex) {
    const fiber = concurrentQueue[i++]
    const queue = concurrentQueue[i++]
    const update = concurrentQueue[i++]
    if(queue !== null && update !== null) {
      const pending = queue.pending
      if(pending === null) {
        update.next = update
      }else {
        pending.next = pending.next
        pending.next = update
      }
      queue.pending = update
    }
  }
}