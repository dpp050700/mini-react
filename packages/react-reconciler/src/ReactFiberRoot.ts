import { Container } from 'shared/ReactTypes'
import { createHostRootFiber, FiberNode } from './ReactFiber'
import { initializeUpdateQueue } from './ReactFiberClassUpdateQueue'

export class FiberRootNode {
  containerInfo: Container
  current: FiberNode
  finishedWork: FiberNode = null
  constructor(container: Container) {
    this.containerInfo = container
  }
}

export function createFiberRoot(containerInfo: Container) {
  const root = new FiberRootNode(containerInfo)
  const uninitializedFiber = createHostRootFiber()

  root.current = uninitializedFiber
  uninitializedFiber.stateNode = root
  initializeUpdateQueue(uninitializedFiber)
  return root
}
