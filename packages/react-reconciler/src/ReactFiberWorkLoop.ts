import { scheduleCallback } from 'scheduler'
import { FiberRootNode } from './ReactFiberRoot'
import { createWorkInProgress, FiberNode } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import { completeWork } from './ReactFiberCompleteWork'
import { MutationMask, NoFlags } from './ReactFiberFlags'
import { commitMutationEffectsOnFiber } from './ReactFiberCommitWork'

let workInProgress: FiberNode = null

export function scheduleUpdateOnFiber(root: FiberRootNode) {
  ensureRootIsScheduled(root)
}

export function ensureRootIsScheduled(root: FiberRootNode) {
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root))
}

function performConcurrentWorkOnRoot(root: FiberRootNode) {
  renderRootSync(root)
  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  commitRoot(root)
}

function renderRootSync(root: FiberRootNode) {
  prepareFreshStack(root)
  workLoopSync()
}

function prepareFreshStack(root: FiberRootNode) {
  workInProgress = createWorkInProgress(root.current, null)
}

function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

function performUnitOfWork(unitOfWork: FiberNode) {
  // current 表示当前正在工作的 fiber 的替身
  const current = unitOfWork.alternate
  const next = beginWork(current, unitOfWork)
  unitOfWork.memoizedProps = unitOfWork.pendingProps
  /**
   * 如果当前 fiber 没有子节点了
   * 说明 当前 fiber 已经完成
   * 然后需要判断 父 fiber 是不是完成了，
   */
  if (next === null) {
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = next
  }
}

/**
 *
 * @param unitOfWork
 * @returns
 * 当一个 fiber 完成之后，需要判断它的 父 fiber 是不是也需要完成
 */
function completeUnitOfWork(unitOfWork: FiberNode) {
  let completedWork = unitOfWork

  while (completedWork !== null) {
    const current = completedWork.alternate
    const returnFiber = completedWork.return
    completeWork(current, completedWork)

    /**
     * 如果当前 fiber 下一个弟弟 fiber
     * 那么就去创建弟弟的子 fiber
     */
    const siblingFiber = completedWork.sibling
    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }
    /**
     * 如果没有弟弟，说明 父 fiber 的所有子 fiber 都构建完成
     * 那么 父 fiber 就应该去完成
     */
    completedWork = returnFiber
    workInProgress = completedWork
  }
}

function commitRoot(root: FiberRootNode) {
  const { finishedWork } = root
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags

  if (subtreeHasEffects || rootHasEffect) {
    commitMutationEffectsOnFiber(finishedWork, root)
  }
  root.current = finishedWork
}
