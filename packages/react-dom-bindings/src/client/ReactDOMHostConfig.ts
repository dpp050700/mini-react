import {diffProperties, setInitialProperties, updateProperties} from './ReactDOMComponent'
import { precacheFiberNode, updateFiberProps } from './ReactDOMComponentTree'

export function shouldSetTextContent(type: any, props: any) {
  return typeof props.children === 'string' || typeof props.children === 'number'
}

export function createTextInstance(content: any) {
  return document.createTextNode(content)
}

export function createInstance(type: string, props: any, fiber: any) {
  const documentElement = document.createElement(type)
  precacheFiberNode(fiber, documentElement)
  // 把属性直接保存在 dom 元素的属性上
  updateFiberProps(documentElement, props)
  return documentElement
}

export function appendInitialChild(parent: any, child: any) {
  parent.appendChild(child)
}

export function finalizeInitialChildren(domElement: any, type: any, props: any) {
  setInitialProperties(domElement, type, props)
}

export function appendChild(parentInstance: any, child: any) {
  parentInstance.appendChild(child)
}

export function insertBefore(parentInstance: any, before: any, child: any) {
  parentInstance.insertBefore(child, before)
}

export function prepareUpdate(domElement: any, type: any, oldProps: any, newProps: any):any{
  return  diffProperties(domElement, type, oldProps, newProps)
}

export function commitUpdate(domElement: any, updatePayload: any, type: any, oldProps: any, newProps: any, finishedWork: any) {
  updateProperties(domElement, updatePayload, type, oldProps, newProps)
  updateFiberProps(domElement, newProps)
}
