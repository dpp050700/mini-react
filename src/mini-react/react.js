import { REACT_ELEMENT, REACT_FORWARD_REF } from './element'
import { REACT_FRAGMENT, wrapToVDom } from './utils'

import { Component } from './Component'

function createElement(type, config, children) {
  let ref
  let key
  if (config) {
    delete config.__source
    delete config.__self
    ref = config.ref
    delete config.ref
    key = config.key
    delete config.key
  }
  let props = { ...config }

  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVDom)
  } else {
    props.children = wrapToVDom(children)
  }

  return {
    $$typeof: REACT_ELEMENT,
    type,
    ref,
    key,
    props
  }
}

function createRef() {
  return { current: null }
}

function forwardRef(fn) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render: fn
  }
}

const React = { createElement, createRef, forwardRef, Component, Fragment: REACT_FRAGMENT }

export default React
