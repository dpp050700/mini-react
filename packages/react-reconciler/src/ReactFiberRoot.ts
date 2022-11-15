import { Container } from 'shared/ReactTypes'
import { createHostRootFiber } from './ReactFiber'
import { initialUpdateQueue } from './ReactFiberClassUpdateQueue'

class FiberRootNode {
  containerInfo: Container
  current: any
  constructor(container: Container) {
    this.containerInfo = container
  }
}

export function createFiberRoot(containerInfo: Container) {
  const root = new FiberRootNode(containerInfo)

  // 创建根节点的 fiber
  const uninitializedFiber = createHostRootFiber()
  // 根容器的 current 指向当前的根 fiber
  root.current = uninitializedFiber
  // 根fiber 的 stateNode （也就是真实的dom 节点），指向 fiberRootNode
  uninitializedFiber.stateNode = root

  initialUpdateQueue(uninitializedFiber)
  return root
}
