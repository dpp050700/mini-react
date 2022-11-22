import { Container, ReactElement } from 'shared/ReactTypes'
import {
  createContainer,
  updateContainer
} from 'react-reconciler/src/ReactFiberReconciler'
import { FiberRootNode } from 'react-reconciler/src/ReactFiberRoot'

function ReactDOMRoot(internalRoot: FiberRootNode) {
  this._internalRoot = internalRoot
}

ReactDOMRoot.prototype.render = function (element: ReactElement) {
  const root = this._internalRoot
  updateContainer(element, root)
}

export function createRoot(container: Container) {
  const root = createContainer(container)
  return new (ReactDOMRoot as any)(root)
}
