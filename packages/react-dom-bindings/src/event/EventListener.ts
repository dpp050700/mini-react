export function addEventCaptureListener(target: any, eventType: any, listener: any) {
  target.addEventListener(eventType, listener, true)
  return listener
}

export function addEventBubbleListener(target: any, eventType: any, listener: any) {
  target.addEventListener(eventType, listener, false)
  return listener
}
