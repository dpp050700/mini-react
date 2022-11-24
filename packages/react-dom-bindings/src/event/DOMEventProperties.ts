import { registerTwoPhaseEvent } from './EventRegistry'
const simpleEventPluginEvents = ['click']

export const topLevelEventsToReactNames = new Map()

function registerSimpleEvent(domEventName: string, reactName: string) {
  topLevelEventsToReactNames.set(domEventName, reactName)
  registerTwoPhaseEvent(reactName, [domEventName])
}

export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i]
    const domEventName = eventName.toLowerCase()
    const capitalizeEvent = eventName[0].toLocaleUpperCase() + eventName.slice(1)

    registerSimpleEvent(domEventName, `on${capitalizeEvent}`)
  }
}
