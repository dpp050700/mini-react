import ReactCurrentDispatcher from './ReactCurrentDispatcher'

function resolveDispatcher() {
  return ReactCurrentDispatcher.current
}

export function useReducer(reducer: any, initialArg: any) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useReducer(reducer, initialArg)
}

export function useState(initialState: any) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useState(initialState)
}

export function useEffect(create: any, deps: any) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useEffect(create, deps)
}
