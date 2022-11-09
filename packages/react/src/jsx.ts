import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { ReactElement, Key, ElementType, Ref, Props } from 'shared/ReactTypes'

export const ReactElement = function (type: ElementType, key: Key, ref: Ref, props: Props) {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props
  }
}

export const jsx = (type: any, config: any) => {
  let props: any = {}
  let key: any = null
  let ref: any = null

  for (let prop in config) {
    const value = config[prop]

    // 取出 key
    if (prop === 'key') {
      key = value !== undefined ? '' + value : null
      continue
    }

    // 取出 ref
    if (prop === 'ref') {
      ref = value !== undefined ? '' + value : null
      continue
    }

    // 构造 props
    if (Object.prototype.hasOwnProperty.call(config, prop)) {
      props[prop] = value
    }
  }

  return ReactElement(type, key, ref, props)
}
