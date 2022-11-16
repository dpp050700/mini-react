import { scheduleCallback } from 'scheduler'
import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'

let workInpProgress: any = null

export function scheduleUpdateOnFiber(root: any) {
  ensureRootIsScheduled(root)
}

function ensureRootIsScheduled(root: any) {
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root))
}

/**
 * 根据 fiber 构建 fiber 树， 创建真实 DOM 节点，把真实的 DOM 节点插入容器
 * @param root
 */
function performConcurrentWorkOnRoot(root: any) {
  // 第一次渲染以同步的方式渲染根节点，初次渲染的时候，都是同步
  renderRootSync(root)
}

function prepareFreshStack(root: any) {
  workInpProgress = createWorkInProgress(root.current, null)
  console.log(workInpProgress)
}

function renderRootSync(root: any) {
  // 开始构建 fiber 树
  prepareFreshStack(root)
  workLoopSync()
}

function workLoopSync() {
  while (workInpProgress !== null) {
    performUnitOfWork(workInpProgress)
  }
}

function performUnitOfWork(unitOfWork: any) {
  // 获取新 fiber 对应的老 fiber
  const current = unitOfWork.alternate
  const next = beginWork(current, unitOfWork)
  unitOfWork.memoizedProps = unitOfWork.pendingProps
  if (next === null) {
    // 如果没有子节点表示当前 fiber 已经完成了
    // completeUnitOfWork(unitOfWork)
    workInpProgress = null
  } else {
    workInpProgress = next
  }
}
