function createElement(type: any, config: any) {
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

  return {
    $$typeof: 'React_element_type',
    type,
    key,
    ref,
    props
  }
}

const React = { createElement }

console.log('3333')

export default React
