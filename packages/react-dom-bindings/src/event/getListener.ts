import { getFiberCurrentPropsFromNode } from '../client/ReactDOMComponentTree'

function getListener(inst: any, registrationName: any) {
  const { stateNode } = inst
  if (stateNode === null) {
    return null
  }

  const props = getFiberCurrentPropsFromNode(stateNode)

  if (props === null) {
    return null
  }
  const listener = props[registrationName] || null

  return listener
}

export default getListener
