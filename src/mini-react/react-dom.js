import { REACT_FRAGMENT, REACT_TEXT } from './utils'
import { addEvent } from './event'
import { REACT_FORWARD_REF } from './element'
import { MOVE, DELETE, PLACEMENT } from './flags'

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
    children[i].mountIndex = i
    mount(children[i], parentDOM)
  }
}

function createDOM(vDom) {
  let { type, props, ref } = vDom
  let dom
  if (type === REACT_FRAGMENT) {
    dom = document.createDocumentFragment()
  } else if (type && type.$$typeof === REACT_FORWARD_REF) {
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
  }
  if (props) {
    updateProps(dom, {}, props)
    if (typeof props.children === 'object' && props.children.type) {
      props.children.mountIndex = 0
      mount(props.children, dom)
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom)
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
  if (oldVDom.type === REACT_FRAGMENT) {
    let currentDOM = (newVDom.dom = findDOM(oldVDom))
    updateChildren(currentDOM, oldVDom.props.children, newVDom.props.children)
  } else if (oldVDom.type === REACT_TEXT) {
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

  let lastPlacedIndex = -1

  let keyedOldMap = {}

  oldVChildren.forEach((oldVChild, index) => {
    let oldKey = oldVChild.key ? oldVChild.key : index
    keyedOldMap[oldKey] = oldVChild
  })

  let patch = []

  newVChildren.forEach((newVChild, index) => {
    newVChild.mountIndex = index
    let newKey = newVChild.key ? newVChild.key : index
    let oldVChild = keyedOldMap[newKey]
    if (oldVChild) {
      updateElement(oldVChild, newVChild)
      // 如果有 说明可以复用老节点
      if (oldVChild.mountIndex < lastPlacedIndex) {
        patch.push({
          type: MOVE,
          oldVChild,
          newVChild,
          mountIndex: index
        })
      }
      delete keyedOldMap[newKey]
      lastPlacedIndex = Math.max(lastPlacedIndex, oldVChild.mountIndex)
    } else {
      patch.push({
        type: PLACEMENT,
        newVChild,
        mountIndex: index
      })
    }
  })

  let moveVChild = patch.filter((action) => action.type === MOVE).map((action) => action.oldVChild)
  Object.values(keyedOldMap)
    .concat(moveVChild)
    .forEach((oldVChild) => {
      let currentDOM = findDOM(oldVChild)
      currentDOM.remove()
    })

  patch.forEach((action) => {
    let { type, oldVChild, newVChild, mountIndex } = action
    let childNodes = parentDOM.childNodes // 删除元素后的真实节点
    if (type === PLACEMENT) {
      let newDOM = createDOM(newVChild)
      let childNode = childNodes[mountIndex]
      if (childNode) {
        parentDOM.insertBefore(newDOM, childNode)
      } else {
        parentDOM.appendChild(newDOM)
      }
    } else if (type === MOVE) {
      let oldDOM = findDOM(oldVChild)
      let childNode = childNodes[mountIndex]
      if (childNode) {
        parentDOM.insertBefore(oldDOM, childNode)
      } else {
        parentDOM.appendChild(oldDOM)
      }
    }
  })

  // let max = Math.max(oldVChildren.length, newVChildren.length)
  // for (let i = 0; i < max; i++) {
  //   let nexVDom = oldVChildren.find((item, index) => index > i && item && findDOM(item))
  //   compareTwoVDom(parentDOM, oldVChildren[i], newVChildren[i], nexVDom?.dom)
  // }
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
  // 暴力更新
  // let oldDom = findDOM(oldVDom)
  // let newDOM = createDOM(newVDom)
  // parentDOM.replaceChild(newDOM, oldDom)
}

export default ReactDOM
