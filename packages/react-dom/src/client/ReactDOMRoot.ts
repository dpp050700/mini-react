import { createContainer, updateContainer } from 'react-reconciler/src/ReactFiberReconciler'
import { Container } from 'shared/ReactTypes'

function ReactDOMRoot(internalRoot: any) {
  this._internalRoot = internalRoot
}

ReactDOMRoot.prototype.render = function (children: any) {
  const root = this._internalRoot
  updateContainer(children, root)
}

export function createRoot(container: Container) {
  const root = createContainer(container)

  console.log(root)

  return new (ReactDOMRoot as any)(root)
}
