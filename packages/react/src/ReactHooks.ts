import ReactCurrentDispatcher from './ReactCurrentDispatcher'

function resolveDispatcher(){
  return ReactCurrentDispatcher.current
}

export function useReducer(reducer:any, initialArg:any) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useReducer(reducer, initialArg)
}