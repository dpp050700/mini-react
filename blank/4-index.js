import React from './mini-react/react'
import ReactDOM from './mini-react/react-dom'

// class UserName extends React.Component {
//   constructor(props) {
//     super(props)
//     this.input = React.createRef()
//   }
//   getFocus = () => {
//     this.input.current.focus()
//   }
//   render() {
//     return <input ref={this.input} />
//   }
// }

function UserName(props, ref) {
  let userNameRef = React.createRef()

  const getFocus = () => {
    userNameRef.current.focus()
  }
  ref.current = {
    getFocus
  }

  return <input ref={userNameRef} />
}

const ForwardUserName = React.forwardRef(UserName)

class Form extends React.Component {
  constructor(props) {
    super(props)
    this.userNameRef = React.createRef()
  }

  getFocus = () => {
    this.userNameRef.current.getFocus()
  }

  render() {
    return (
      <div>
        <ForwardUserName ref={this.userNameRef} />
        <button onClick={this.getFocus}>获得焦点</button>
      </div>
    )
  }
}

let element = <Form></Form>

ReactDOM.render(element, document.getElementById('root'))
