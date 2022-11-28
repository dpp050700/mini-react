import { setValueForStyles } from './CSSPropertyOperations'
import setTextContent from './setTextContent'
import { setValueForProperty } from './DOMPropertyOperations'

const STYLE = 'style'
const CHILDREN = 'children'

function setInitialDOMProperties(tag: any, domElement: any, nextProps: any) {
  for (const propKey in nextProps) {
    if (nextProps.hasOwnProperty(propKey)) {
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

export function diffProperties(domElement: any, tag: any, lastProps: any, nextProps: any){
  let updatePayload:any = null
  let propKey;
  let styleName;
  let styleUpdates:any = null

  // 处理属性的删除： 如果一个属性在老对象里有，在新的对象里没有，就是要删除
  for(propKey in lastProps) {
    // 如果新属性对象里有此属性，或者老的里面没有此属性，或者老的是个 null
    if(nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] === null) {
      continue
    }
    if(propKey === STYLE){
      const lastStyle = lastProps[propKey]
      for(styleName in lastStyle) {
        if(lastStyle.hasOwnProperty(styleName)) {
          if(!styleUpdates) {
            styleUpdates = {}
          }
          styleUpdates[styleName] = ''
        }
      }
    }else {
      (updatePayload = updatePayload || []).push(propKey, null)
    }
  }
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey]
    const lastProp = lastProps !== null ? lastProps[propKey] : undefined
    if(!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || (nextProp === null && lastProp === null)) {
      continue
    }
    if(propKey === STYLE) {
      if(lastProp) {
        for(styleName in lastProp) {
          if(lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
            if(!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = ''
          }
        }
        for (styleName in nextProp) {
          if(nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
            if(!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = nextProp[styleName]
          }
        }
      } else {
        styleUpdates = nextProp
      }
    }else if(propKey === CHILDREN){
      if(typeof  nextProp === 'string' || typeof nextProp === 'number') {
        (updatePayload = updatePayload || []).push(propKey, nextProp)
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, nextProp)
    }
  }
  if(styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates)
  }
  return updatePayload
}

export function updateProperties(domElement:any, updatePayload:any) {
  updateDOMProperties(domElement, updatePayload)
}

export function updateDOMProperties(domElement:any, updatePayload:any) {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue);
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else {
      setValueForProperty(domElement, propKey, propValue);
    }
  }
}
