export function setValueForProperty(node: Element, name: any, value: any) {
  if (value === null) {
    node.removeAttribute(name)
  } else {
    node.setAttribute(name, value)
  }
}
