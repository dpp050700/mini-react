import { scheduleCallback } from 'scheduler'
import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import { completeWork } from './ReactFiberCompleteWork'
import { NoFlags, MutationMask, Passive } from './ReactFiberFlags'
import {
  commitMutationEffectsOnFiber,
  commitPassiveUnmountEffects,
  commitPassiveMountEffects
} from './ReactFiberCommitWork'
import { finishQueueingConcurrentUpdates } from './ReactFiberConcurrentUpdates'

let workInProgress: any = null

let workInProgressRoot: any = null

let rootDoesHavePassiveEffect = false // 根节点上有没有 useEffect类似的副作用

let rootWithPendingPassiveEffects: any = null // 具有 useEffect 副作用的根节点 FiberRootNode, 根 fiber

export function scheduleUpdateOnFiber(root: any) {
  ensureRootIsScheduled(root)
}

function ensureRootIsScheduled(root: any) {
  if (workInProgressRoot) return
  workInProgressRoot = root
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root))
}

/**
 * 根据 fiber 构建 fiber 树， 创建真实 DOM 节点，把真实的 DOM 节点插入容器
 * @param root
 */
function performConcurrentWorkOnRoot(root: any) {
  // 第一次渲染以同步的方式渲染根节点，初次渲染的时候，都是同步
  renderRootSync(root)
  // 开始进入提交阶段 就是执行副作用，修改真实 dom
  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  commitRoot(root)
  workInProgressRoot = null
}

function flushPassiveEffect() {
  if (rootWithPendingPassiveEffects !== null) {
    const root = rootWithPendingPassiveEffects
    // 执行卸载副作用
    commitPassiveUnmountEffects(root.current)
    // 执行挂载副作用
    commitPassiveMountEffects(root, root.current)
  }
}

function commitRoot(root: any) {
  // 新构建的根 fiber
  const { finishedWork } = root
  if ((finishedWork.subtreeFlags & Passive) !== NoFlags || (finishedWork.flags & Passive) !== NoFlags) {
    if (!rootDoesHavePassiveEffect) {
      rootDoesHavePassiveEffect = true
      scheduleCallback(flushPassiveEffect)
    }
  }
  const subtreeHasEffects = (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags
  // 如果自己有副作用或者子节点有副作用就进行提交DOM操作
  if (subtreeHasEffects || rootHasEffect) {
    // DOM 执行变更之后
    commitMutationEffectsOnFiber(finishedWork, root)
    if (rootDoesHavePassiveEffect) {
      rootDoesHavePassiveEffect = false
      rootWithPendingPassiveEffects = root
    }
  }
  root.current = finishedWork
}

function prepareFreshStack(root: any) {
  workInProgress = createWorkInProgress(root.current, null)
  finishQueueingConcurrentUpdates()
}

function renderRootSync(root: any) {
  // 开始构建 fiber 树
  prepareFreshStack(root) // 创建一个新的 hostRootFiber
  workLoopSync()
}

function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

function performUnitOfWork(unitOfWork: any) {
  const current = unitOfWork.alternate
  const next = beginWork(current, unitOfWork)
  unitOfWork.memoizedProps = unitOfWork.pendingProps
  if (next === null) {
    // 如果没有子节点表示当前 fiber 已经完成了
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = next
  }
}

function completeUnitOfWork(unitOfWork: any) {
  let completedWork = unitOfWork

  while (completedWork !== null) {
    const current = completedWork.alternate
    const returnFiber = completedWork.return
    completeWork(current, completedWork)
    const siblingFiber = completedWork.sibling
    // 如果有弟弟，就构建弟弟对应的 fiber 子链表
    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }
    // 如果没有弟弟，说明这当前完成的就是 父 fiber 的最后一个节点
    // 也就是说一个 父 fiber，所有的子 fiber 全部完成了
    completedWork = returnFiber
    workInProgress = completedWork
  }
}
