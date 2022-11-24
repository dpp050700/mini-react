export const allNativeEvents = new Set()

/**
 *
 * @param registrationName React 事件名 onClick
 * @param dependencies 原生事件数组 click
 */
export function registerTwoPhaseEvent(registrationName: string, dependencies: any) {
  registerDirectEvent(registrationName, dependencies)
  registerDirectEvent(registrationName + 'Capture', dependencies)
}

export function registerDirectEvent(registrationName: string, dependencies: any) {
  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i])
  }
}
