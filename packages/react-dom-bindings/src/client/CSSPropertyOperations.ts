export function setValueForStyles(node: any, styles: any) {
  const style = node.style
  for (const styleName in styles) {
    if (Object.prototype.hasOwnProperty.call(styles, styleName)) {
      const styleValue = styles[styleName]
      style[styleName] = styleValue
    }
  }
}
