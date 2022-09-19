import { updateQueue } from './Component'

export function addEvent(dom, eventType, handler) {
  let store = dom.store || (dom.store = {})
  store[eventType] = handler
  if (!document[eventType]) {
    document[eventType] = dispatchEvent
  }
}

function preventDefault() {
  this.isDefaultPrevented = true
  const event = this.nativeEvent
  if (event.preventDefault) {
    event.preventDefault()
  } else {
    event.returnValue = false
  }
}

function stopPropagation() {
  this.isPropagationStopped = true
  const event = this.nativeEvent
  if (event.stopPropagation) {
    event.stopPropagation()
  } else {
    event.cancelBubble = true
  }
}

function createSyntheticEvent(nativeEvent) {
  let syntheticEvent = {}
  for (let key in nativeEvent) {
    let value = nativeEvent[key]
    if (typeof value === 'function') value = value.bind(nativeEvent)
    syntheticEvent[key] = value
  }
  syntheticEvent.nativeEvent = nativeEvent
  syntheticEvent.isDefaultPrevented = false // 是否已经阻止了默认事件
  syntheticEvent.preventDefault = preventDefault
  syntheticEvent.isPropagationStopped = false // 是否已经阻止了默认事件
  syntheticEvent.stopPropagation = stopPropagation

  return syntheticEvent
}

/**
 * 1. 屏蔽浏览器的差异
 * 2. 批量更新
 * @param {*} event
 */
function dispatchEvent(event) {
  updateQueue.isBathingUpdate = true
  let { target, type } = event
  let syntheticEvent = createSyntheticEvent(event)
  let currentTarget = target
  while (currentTarget) {
    let eventType = `on${type}`
    const { store } = currentTarget
    let handle = store && store[eventType]
    handle && handle(syntheticEvent)
    if (syntheticEvent.isPropagationStopped) {
      break
    }
    currentTarget = currentTarget.parentNode
  }

  updateQueue.batchUpdate()
}
