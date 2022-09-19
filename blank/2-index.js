import React from './mini-react/react'
import ReactDOM from './mini-react/react-dom'

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { number: 0 }
  }

  handleClick = (event) => {
    event.stopPropagation()
    this.setState({ number: this.state.number + 1 })
    console.log(this.state)
    this.setState({ number: this.state.number + 1 })
    console.log(this.state)
    setTimeout(() => {
      this.setState({ number: this.state.number + 1 })
      console.log(this.state)
      this.setState({ number: this.state.number + 1 })
      console.log(this.state)
    }, 50)
  }

  handleDivClick = () => {
    console.log(111)
  }

  render() {
    return (
      <div onClick={this.handleDivClick}>
        <p>{this.props.title}</p>
        <p>number : {this.state.number}</p>

        <button onClick={this.handleClick}>add(+)</button>
      </div>
    )
  }
}

let element = <Counter title="计数器"></Counter>

ReactDOM.render(element, document.getElementById('root'))
