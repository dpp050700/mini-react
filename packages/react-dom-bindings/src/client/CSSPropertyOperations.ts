export function setValueForStyles(node: any, styles: any) {
  const style = node.style
  for (const styleName in styles) {
    if (styles.hasOwnProperty(styleName)) {
      const styleValue = styles[styleName]
      style[styleName] = styleValue
    }
  }
}
