import {
  Key,
  Ref,
  Props,
  ElementType,
  ReactElement as ReactElementType
} from 'shared/ReactTypes'
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import hasOwnProperty from 'shared/hasOwnProperty'

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
}

const ReactElement = function (
  type: ElementType,
  key: Key,
  ref: Ref,
  props: Props
): ReactElementType {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props
  }
}

function hasValidRef(config: any) {
  return config.ref !== undefined
}

function hasValidKey(config: any) {
  return config.key !== undefined
}

export function jsx(type: ElementType, config: Record<string, any>) {
  const props: Props = {}
  let key: Key = null
  let ref: Ref = null
  let propName: string = null
  for (propName in config) {
    const value = config[propName]

    if (propName === 'key') {
      if (hasValidKey(config)) {
        key = value + ''
      }
      continue
    }
    if (propName === 'ref') {
      if (hasValidRef(config)) {
        ref = value + ''
      }
      continue
    }

    if (
      hasOwnProperty.call(config, propName) &&
      !hasOwnProperty.call(RESERVED_PROPS, propName)
    ) {
      props[propName] = value
    }
  }

  return ReactElement(type, key, ref, props)
}

export const jsxDEV = jsx
