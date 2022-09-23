import React from './mini-react/react'
import ReactDOM from './mini-react/react-dom'

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [
        { name: '张三', key: 'zhangsan ' },
        { name: '李四', key: 'lisi ' },
        { name: '王二', key: 'wanger ' },
        { name: '麻子', key: 'mazi ' }
      ]
    }
  }

  handleClick = () => {
    this.setState({
      list: [
        { name: '张三', key: 'zhangsan ' },
        { name: '赵大', key: 'zhaoda ' },
        { name: '王二', key: 'wanger ' },
        { name: '李四', key: 'lisi ' },
        { name: '团子', key: 'tuanzi ' }
      ]
    })
  }

  render() {
    return (
      <React.Fragment>
        <div>
          {this.state.list.map((item) => {
            return <div key={item.key}>姓名：{item.name}</div>
          })}
        </div>

        <button onClick={this.handleClick}>+</button>
      </React.Fragment>
    )
  }
}

let element = <Counter></Counter>

ReactDOM.render(element, document.getElementById('root'))
