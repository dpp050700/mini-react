import React from './mini-react/react'
import ReactDOM from './mini-react/react-dom'

class Counter extends React.Component {
  static defaultProps = {
    name: 'zh_san'
  }
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
    console.log('1 Counter constructor')
  }

  handleClick = () => {
    this.setState({ number: this.state.number + 1 })
  }
  componentWillMount() {
    console.log('2 Counter componentWillMount')
  }

  render() {
    console.log('3 Counter render')
    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
  componentDidMount() {
    console.log('4 Counter componentDidMount')
  }

  componentWillReceiveProps() {
    console.log('Counter componentWillReceiveProps')
  }

  shouldComponentUpdate() {
    console.log('Counter shouldComponentUpdate')
    return true
  }

  componentWillUpdate() {
    console.log('Counter componentWillUpdate')
  }

  componentDidUpdate() {
    console.log('Counter componentDidUpdate')
  }
}

let element = <Counter></Counter>

ReactDOM.render(element, document.getElementById('root'))
