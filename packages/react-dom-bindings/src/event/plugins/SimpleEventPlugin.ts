import { registerSimpleEvents, topLevelEventsToReactNames } from '../DOMEventProperties'
import { accumulateSinglePhaseListeners } from '../DOMPluginEventSystem'
import { IS_CAPTURE_PHASE } from '../EventSystemFlags'
import {SyntheticMouseEvent} from '../SyntheticEvent'

function extractEvents(
  dispatchQueue: any,
  domEventName: any,
  targetInst: any,
  nativeEvent: any,
  nativeEventTarget: any,
  eventSystemFlags: any,
  targetContainer: any
) {
  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
  const reactName = topLevelEventsToReactNames.get(domEventName)
  const listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, isCapturePhase)

  let SyntheticEventCtor // 合成事件的构造函数

  switch (domEventName) {
    case  'click':
      SyntheticEventCtor = SyntheticMouseEvent
      break
    default:
      break
  }

  if (listeners.length > 0) {
    const event = new SyntheticEventCtor(reactName, domEventName, targetInst, nativeEvent, nativeEventTarget)
    dispatchQueue.push({
      event,
      listeners
    })
  }
}

export { registerSimpleEvents as registerEvents, extractEvents }
