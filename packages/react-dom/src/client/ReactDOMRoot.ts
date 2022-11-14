import { createContainer } from 'react-reconciler/src/ReactFiberReconciler'
import { Container } from 'shared/ReactTypes'

function ReactDOMRoot(internalRoot: any) {
  this._internalRoot = internalRoot
}

ReactDOMRoot.prototype.render = function () {
  console.log('render')
}

export function createRoot(container: Container) {
  const root = createContainer(container)

  return new (ReactDOMRoot as any)(root)
}
