import { getEventTarget } from './getEventTarget'
import { getClosestInstanceFromNode } from '../client/ReactDOMComponentTree'
import { dispatchEventForPluginEventSystem } from './DOMPluginEventSystem'

export function createEventListenerWrapperWithPriority(targetContainer: any, domEventName: any, eventSystemFlags: any) {
  const listenerWrapper = dispatchDiscreteEvent
  return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer)
}

function dispatchDiscreteEvent(domEventName: any, eventSystemFlags: any, container: any, nativeEvent: any) {
  dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent)
}

export function dispatchEvent(domEventName: any, eventSystemFlags: any, container: any, nativeEvent: any) {
  const nativeEventTarget = getEventTarget(nativeEvent)
  const targetInst = getClosestInstanceFromNode(nativeEventTarget)
  dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, container)
}
