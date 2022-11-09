console.log('react-dom')

function render(vDom, container) {
  container.append(document.createTextNode('div'))
}

const ReactDOM = {
  render
}

export default ReactDOM
