import { Container, ReactElement } from 'shared/ReactTypes'
import { createFiberRoot, FiberRootNode } from './ReactFiberRoot'
import { createUpdate, enqueueUpdate } from './ReactFiberClassUpdateQueue'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'

export function createContainer(container: Container) {
  return createFiberRoot(container)
}

export function updateContainer(
  element: ReactElement,
  container: FiberRootNode
) {
  const current = container.current

  const update = createUpdate()
  update.payload = { element }
  const root = enqueueUpdate(current, update)
  scheduleUpdateOnFiber(root)
}
