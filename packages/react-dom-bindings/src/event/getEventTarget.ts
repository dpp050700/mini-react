export function getEventTarget(nativeEvent: any) {
  const target = nativeEvent.target || nativeEvent.srcElement || window
  return target
}
