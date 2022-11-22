import { setValueForStyles } from './CSSPropertyOperations'
import setTextContent from './setTextContent'
import { setValueForProperty } from './DOMPropertyOperations'

const STYLE = 'style'
const CHILDREN = 'children'

function setInitialDOMProperties(tag: any, domElement: any, nextProps: any) {
  for (const propKey in nextProps) {
    if (Object.prototype.hasOwnProperty.call(nextProps, propKey)) {
      const nextProp = nextProps[propKey]
      if (propKey === STYLE) {
        setValueForStyles(domElement, nextProp)
      } else if (propKey === CHILDREN) {
        if (typeof nextProp === 'string') {
          setTextContent(domElement, nextProp)
        } else if (typeof nextProp === 'number') {
          setTextContent(domElement, nextProp + '')
        }
      } else if (nextProp !== null) {
        setValueForProperty(domElement, propKey, nextProp)
      }
    }
  }
}

export function setInitialProperties(domElement: any, tag: any, props: any) {
  setInitialDOMProperties(tag, domElement, props)
}
