export const REACT_TEXT = Symbol('react.text')

// 此逻辑源码没有
export function wrapToVDom(element) {
  return typeof element === 'string' || typeof element === 'number' ? { type: REACT_TEXT, props: element } : element
}
