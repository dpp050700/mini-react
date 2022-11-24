import { HostComponent } from './../../../react-reconciler/src/ReactWorkTags'
import { allNativeEvents } from './EventRegistry'
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin'
import { IS_CAPTURE_PHASE } from './EventSystemFlags'
import { createEventListenerWrapperWithPriority } from './ReactDOMEventListener'
import { addEventCaptureListener, addEventBubbleListener } from './EventListener'
import { getEventTarget } from './getEventTarget'
import getListener from './getListener'

SimpleEventPlugin.registerEvents()

const listeningMarker = `_reactListening` + Math.random().toString(36).slice(2)

export function listenToAllSupportedEvents(rootContainerElement: any) {
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true

    allNativeEvents.forEach((domEventName) => {
      // console.log(domEventName)
      listenToNativeEvent(domEventName, true, rootContainerElement)
      listenToNativeEvent(domEventName, false, rootContainerElement)
    })
  }
}

export function listenToNativeEvent(domEventName: any, isCapturePhaseListener: boolean, target: Element) {
  let eventSystemFlags = 0 // 默认是 0 指的是冒泡； 4 是捕获

  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE
  }

  addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener)
}

function addTrappedEventListener(
  targetContainer: any,
  domEventName: any,
  eventSystemFlags: any,
  isCapturePhaseListener: any
) {
  const listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags)

  if (isCapturePhaseListener) {
    addEventCaptureListener(targetContainer, domEventName, listener)
  } else {
    addEventBubbleListener(targetContainer, domEventName, listener)
  }
}

export function dispatchEventForPluginEventSystem(
  domEventName: any,
  eventSystemFlags: any,
  nativeEvent: any,
  targetInst: any,
  targetContainer: any
) {
  dispatchEventForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer)
}

function dispatchEventForPlugins(
  domEventName: any,
  eventSystemFlags: any,
  nativeEvent: any,
  targetInst: any,
  targetContainer: any
) {
  const nativeEventTarget = getEventTarget(nativeEvent)
  const dispatchQueue: any = []

  extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )

  processDispatchQueue(dispatchQueue, eventSystemFlags)
}

function processDispatchQueue(dispatchQueue:any, eventSystemFlags: any){
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
  for (let i = 0; i < dispatchQueue.length; i++) {
    const { event, listeners } = dispatchQueue[i]
    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase)
  }
}

function executeDispatch(event: any, listener: any, currentTarget: any) {
  event.currentTarget = currentTarget
  listener(event)
}

function processDispatchQueueItemsInOrder(event:any, dispatchListeners:any, inCapturePhase:any) {
  if(inCapturePhase) {
    for (let i = dispatchListeners.length -1; i >=0; i--) {
      const {listener, currentTarget} = dispatchListeners[i]
      if(event.isPropagationStopped()){
        return
      }
      executeDispatch(event, listener, currentTarget)
    }
  }else {
    for(let i = 0; i < dispatchListeners.length; i++) {
      const {listener, currentTarget} = dispatchListeners[i]
      if(event.isPropagationStopped()){
        return
      }
      executeDispatch(event, listener, currentTarget)
    }
  }
}

function extractEvents(
  dispatchQueue: any,
  domEventName: any,
  targetInst: any,
  nativeEvent: any,
  nativeEventTarget: any,
  eventSystemFlags: any,
  targetContainer: any
) {
  SimpleEventPlugin.extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )
}

export function accumulateSinglePhaseListeners(
  targetFiber: any,
  reactName: any,
  nativeEventType: any,
  inCapturePhase: any
) {
  const captureName = reactName + 'Capture'

  const reactEventName = inCapturePhase ? captureName : reactName
  const listeners: any = []

  let instance = targetFiber

  while (instance !== null) {
    const { stateNode, tag } = instance
    if (tag === HostComponent && stateNode !== null) {
      if (reactEventName !== null) {
        const listener = getListener(instance, reactEventName)
        if (listener) {
          listeners.push(createDispatchListener(instance, listener, stateNode))
        }
      }
    }
    instance = instance.return
  }
  return listeners
}

function createDispatchListener(instance:any, listener:any, currentTarget:any) {
  return {
    instance, listener, currentTarget
  }
}
