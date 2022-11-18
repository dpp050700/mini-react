function ReactDOMRoot() {}

ReactDOMRoot.prototype.render = function () {
  console.log('render')
}

export function createRoot() {
  return new ReactDOMRoot()
}
