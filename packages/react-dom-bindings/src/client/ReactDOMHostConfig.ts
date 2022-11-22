import { setInitialProperties } from './ReactDOMComponent'

export function shouldSetTextContent(type: string, props: any) {
  return (
    typeof props.children === 'string' || typeof props.children === 'number'
  )
}

export function createTextInstance(content: string) {
  return document.createTextNode(content)
}

export function createInstance(type: string, props: any, fiber: any) {
  const documentElement = document.createElement(type)

  return documentElement
}

export function appendInitialChild(parent: Element, child: Element) {
  parent.appendChild(child)
}

export function appendChild(parentInstance: any, child: any) {
  parentInstance.appendChild(child)
}

export function finalizeInitialChildren(
  domElement: Element,
  type: string,
  props: any
) {
  setInitialProperties(domElement, type, props)
}

export function insertBefore(
  parentInstance: Element,
  before: Element,
  child: Element
) {
  parentInstance.insertBefore(child, before)
}
