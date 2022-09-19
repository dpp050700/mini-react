import { REACT_TEXT } from './utils'
import { addEvent } from './event'
import { REACT_FORWARD_REF } from './element'

function updateProps(dom, oldProps = {}, newProps) {
  for (let key in newProps) {
    if (key === 'children') {
      continue
    } else if (key === 'style') {
      let styleObj = newProps[key]
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr]
      }
    } else if (/^on[A-Z].*/.test(key)) {
      // dom[key.toLocaleLowerCase()] = newProps[key]
      addEvent(dom, key.toLocaleLowerCase(), newProps[key])
    } else {
      dom[key] = newProps[key]
    }
  }

  for (let key in oldProps) {
    if (!newProps.hasOwnProperty(key)) {
      dom[key] = null
    }
  }
}

function reconcileChildren(children, parentDOM) {
  for (let i = 0; i < children.length; i++) {
    mount(children[i], parentDOM)
  }
}

function createDOM(vDom) {
  let { type, props, ref } = vDom
  let dom
  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return mountForwardComponent(vDom)
  } else if (type === REACT_TEXT) {
    dom = document.createTextNode(props)
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      return mountClassComponent(vDom)
    }
    return mountFunctionComponent(vDom)
  } else {
    dom = document.createElement(type)
    if (props) {
      updateProps(dom, {}, props)
      if (typeof props.children === 'object' && props.children.type) {
        mount(props.children, dom)
      } else if (Array.isArray(props.children)) {
        reconcileChildren(props.children, dom)
      }
    }
  }
  // 虚拟 Dom 上关联真实 dom
  vDom.dom = dom
  if (ref) {
    ref.current = dom
  }
  return dom
}

function render(vDom, container) {
  mount(vDom, container)
}

function mount(vDom, container) {
  // if (!vDom) {
  //   container.remove()
  //   return
  // }
  let newDOM = createDOM(vDom)
  container.append(newDOM)
}

function mountFunctionComponent(vDom) {
  let { type: FunctionComponent, props } = vDom
  let renderVDom = FunctionComponent(props)
  vDom.oldRenderVDom = renderVDom
  return createDOM(renderVDom)
}

function mountClassComponent(vDom) {
  const { type: ClassComponent, props, ref } = vDom
  let classInstance = new ClassComponent(props)
  vDom.classInstance = classInstance
  if (ref) {
    ref.current = classInstance
  }
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount()
  }
  let renderVDom = classInstance.render()
  classInstance.oldRenderVDom = renderVDom
  let dom = createDOM(renderVDom)
  if (classInstance.componentDidMount) {
    classInstance.componentDidMount()
  }
  return dom
}

function mountForwardComponent(vDom) {
  let { type, props, ref } = vDom
  let renderVDom = type.render(props, ref)
  vDom.oldRenderVDom = renderVDom
  return createDOM(renderVDom)
}

function unmountVDom(vDom) {
  const { props, ref } = vDom
  const currentDOM = findDOM(vDom)
  if (vDom.classInstance && vDom.classInstance.componentWillUnmount) {
    vDom.classInstance.componentWillUnmount()
  }
  if (ref) {
    ref.current = null
  }
  if (props.children) {
    let children = Array.isArray(props.children) ? props.children : [props.children]
    children.forEach((item) => unmountVDom(item))
  }
  if (currentDOM) currentDOM.remove()
}

function updateElement(oldVDom, newVDom) {
  if (oldVDom.type === REACT_TEXT) {
    let currentDOM = (newVDom.dom = findDOM(oldVDom))
    if (oldVDom.props !== newVDom.props) {
      currentDOM.textContent = newVDom.props
    }
  } else if (typeof oldVDom.type === 'string') {
    let currentDOM = (newVDom.dom = findDOM(oldVDom))
    updateProps(currentDOM, oldVDom.props, newVDom.props)
    updateChildren(currentDOM, oldVDom.props.children, newVDom.props.children)
  } else if (typeof oldVDom.type === 'function') {
    if (oldVDom.type.isReactComponent) {
      updateClassComponent(oldVDom, newVDom)
    } else {
      updateFunctionComponent(oldVDom, newVDom)
    }
  }
}

function updateClassComponent(oldVDom, newVDom) {
  const classInstance = (newVDom.classInstance = oldVDom.classInstance)
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps(newVDom.props)
  }
  classInstance.updater.emitUpdate(newVDom.props)
}

function updateFunctionComponent(oldVDom, newVDom) {
  let currentDOM = findDOM(oldVDom)
  if (!currentDOM) return
  let parentDOM = createDOM.parentNode
  const { type, props } = newVDom
  let newRenderVDom = type(props)
  compareTwoVDom(parentDOM, oldVDom.oldRenderVDom, newRenderVDom)
  newVDom.oldRenderVDom = newRenderVDom
}

function updateChildren(parentDOM, oldVChildren, newVChildren) {
  oldVChildren = Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren]
  newVChildren = Array.isArray(newVChildren) ? newVChildren : [newVChildren]

  let max = Math.max(oldVChildren.length, newVChildren.length)
  for (let i = 0; i < max; i++) {
    let nexVDom = oldVChildren.find((item, index) => index > i && item && findDOM(item))
    compareTwoVDom(parentDOM, oldVChildren[i], newVChildren[i], nexVDom?.dom)
  }
}

const ReactDOM = {
  render
}

export function findDOM(vDom) {
  if (!vDom) return null
  if (vDom.dom) {
    return vDom.dom
  } else {
    let renderVDom = vDom.classInstance ? vDom.classInstance.oldRenderVDom : vDom.oldRenderVDom
    return findDOM(renderVDom)
  }
}

export function compareTwoVDom(parentDOM, oldVDom, newVDom, nextDOM) {
  if (!oldVDom && !newVDom) {
    return null
  } else if (oldVDom && !newVDom) {
    unmountVDom(oldVDom)
  } else if (!oldVDom && newVDom) {
    let newDOM = createDOM(newVDom)
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM)
    } else {
      parentDOM.appendChild(newDOM)
    }
  } else if (oldVDom && newVDom && oldVDom.type !== newVDom.type) {
    unmountVDom(oldVDom)
    let newDOM = createDOM(newVDom)
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM)
    } else {
      parentDOM.appendChild(newDOM)
    }
  } else {
    updateElement(oldVDom, newVDom)
  }
  // let oldDom = findDOM(oldVDom)
  // let newDOM = createDOM(newVDom)
  // parentDOM.replaceChild(newDOM, oldDom)
}

export default ReactDOM
