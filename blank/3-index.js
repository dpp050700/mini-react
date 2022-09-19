import React from './mini-react/react'
import ReactDOM from './mini-react/react-dom'

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.valueA = React.createRef()
    this.valueC = React.createRef()
    this.valueR = React.createRef()
  }

  handleClick = () => {
    let a = this.valueA.current.value
    let c = this.valueC.current.value
    this.valueR.current.value = a + c
  }

  render() {
    return (
      <div>
        <input ref={this.valueA} />
        +
        <input ref={this.valueC} />
        <button onClick={this.handleClick}>=</button>
        <input ref={this.valueR} />
      </div>
    )
  }
}

let element = <Counter title="计数器"></Counter>

ReactDOM.render(element, document.getElementById('root'))
