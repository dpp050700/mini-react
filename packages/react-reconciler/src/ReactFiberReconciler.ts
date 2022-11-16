import { Container } from 'shared/ReactTypes'
import { createFiberRoot } from './ReactFiberRoot'
import { createUpdate, enqueueUpdate } from './ReactFiberClassUpdateQueue'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'

export function createContainer(container: Container) {
  return createFiberRoot(container)
}

/**
 * 更新容器，把虚拟 dom element 变成真实 dom 插入到 container
 * @param element 虚拟 dom
 * @param container dom 容器 FiberRootNode containerInfo
 */
export function updateContainer(element: any, container: any) {
  // 获取当前的根 fiber
  const current = container.current
  // 创建更新
  const update = createUpdate()
  // 要更新的虚拟 DOM
  update.payload = { element }
  // 把此更新对象添加到 current 这个 根 fiber 的更新队列上, 返回根节点
  const root = enqueueUpdate(current, update)
  scheduleUpdateOnFiber(root)
}
