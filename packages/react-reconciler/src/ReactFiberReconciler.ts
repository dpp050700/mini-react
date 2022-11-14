import { Container } from 'shared/ReactTypes'
import { createFiberRoot } from './ReactFiberRoot'

export function createContainer(container: Container) {
  return createFiberRoot(container)
}
