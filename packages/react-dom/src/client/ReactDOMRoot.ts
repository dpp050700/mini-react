import { createContainer, updateContainer } from 'react-reconciler/src/ReactFiberReconciler'
import { Container } from 'shared/ReactTypes'
import { listenToAllSupportedEvents } from 'react-dom-bindings/src/event/DOMPluginEventSystem'

function ReactDOMRoot(internalRoot: any) {
  this._internalRoot = internalRoot
}

ReactDOMRoot.prototype.render = function (children: any) {
  const root = this._internalRoot
  root.containerInfo.innerHTML = ''
  updateContainer(children, root)
}

export function createRoot(container: Container) {
  const root = createContainer(container)

  listenToAllSupportedEvents(container)

  return new (ReactDOMRoot as any)(root)
}
