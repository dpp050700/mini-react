import { Container } from 'shared/ReactTypes'

class FiberRootNode {
  container: Container
  constructor(container: Container) {
    console.log(11112)
    this.container = container
  }
}

export function createFiberRoot(containerInfo: Container) {
  const root = new FiberRootNode(containerInfo)
  return root
}
