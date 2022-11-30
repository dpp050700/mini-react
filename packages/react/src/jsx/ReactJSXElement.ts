import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { ReactElement, Key, ElementType, Ref, Props } from 'shared/ReactTypes'
import hasOwnProperty from 'shared/hasOwnProperty'

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
}

function hasValidRef(config: any) {
  return config.ref !== undefined
}

function hasValidKey(config: any) {
  return config.key !== undefined
}

const ReactElement = function (type: ElementType, key: Key, ref: Ref, props: Props): ReactElement {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type, // dom 类型：span、div、h1
    key, // 唯一标识
    ref,
    props
  }
}

// React 18 中 babel 会把 jsx 转换成 jsx() 函数，而在 17 之前是转成 React.createElement
// jsx 函数 会把 children 放在 props 中， 而 React.createElement 的 children 是一个一个传的。
export const jsx = (type: any, config: any, maybeKey:any) => {

  let props: Props = {}
  let key: Key = null
  let ref: Ref = null

  let propName: string = null

  if(typeof maybeKey !== undefined) {
    key = maybeKey + ''
  }

  if (hasValidKey(config)) {
    key = config.key + ''
  }

  if (hasValidRef(config)) {
    ref = config.ref + ''
  }

  for (propName in config) {
    const value = config[propName]

    // 取出 key
    // if (propName === 'key') {
    //   if (hasValidKey(config)) {
    //     key = value + ''
    //   }
    //   continue
    // }

    // 取出 ref
    // if (propName === 'ref') {
    //   if (hasValidRef(config)) {
    //     ref = value + ''
    //   }
    //   continue
    // }

    // 构造 props
    if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
      props[propName] = value
    }
  }

  return ReactElement(type, key, ref, props)
}

export const jsxDEV = jsx
