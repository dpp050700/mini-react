import React from './mini-react/react'
import ReactDOM from './mini-react/react-dom'

class Result extends React.Component {
  componentWillReceiveProps() {
    console.log('Result componentWillReceiveProps')
  }

  shouldComponentUpdate() {
    console.log('Result shouldComponentUpdate')
    return true
  }

  componentWillUpdate() {
    console.log('Result componentWillUpdate')
  }

  componentWillUnmount() {
    console.log('Result componentWillUnmount')
  }

  componentDidUpdate() {
    console.log('Result componentDidUpdate')
  }
  render() {
    console.log('Result render')
    return <div>总计：{this.props.sum}</div>
  }
}

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
        {this.state.number === 4 ? null : <Result sum={this.state.number} />}
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
  componentDidMount() {
    console.log('4 Counter componentDidMount')
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
