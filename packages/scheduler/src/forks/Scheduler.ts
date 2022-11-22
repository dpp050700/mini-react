export function scheduleCallback(callback: any) {
  requestIdleCallback(callback)
}
