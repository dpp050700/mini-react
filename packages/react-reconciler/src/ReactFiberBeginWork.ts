import { HostRoot, HostComponent, HostText } from './ReactWorkTags'

function updateHostRoot(current: any, workInProgress: any) {}

function updateHostComponent(current: any, workInProgress: any) {}

function updateHostText(current: any, workInProgress: any): null {
  return null
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
      break
    case HostComponent:
      return updateHostComponent(current, workInProgress)
      break
    case HostText:
      return updateHostText(current, workInProgress)
      break
    default:
      break
  }
}

export { beginWork }
