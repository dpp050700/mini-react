// import React from 'react'
// import ReactDOM from 'react-dom'
// // import ReactDOM from 'react-dom/client'
// import App from './App'

// const root = ReactDOM.createRoot(document.getElementById('root'))
// root.render(<App />)

// // ReactDOM.render(
// //   <React.StrictMode>
// //     <App />
// //   </React.StrictMode>,
// //   document.getElementById('root')
// // )

import React from './mini-react/react'
import ReactDOM from './mini-react/react-dom'
// import ReactDOM from 'react-dom/client'
// const root = ReactDOM.createRoot(document.getElementById('root'))

// import App from './App'

// let element = (
//   <h1 className="title" style={{ color: 'red' }}>
//     hello
//     <span>world</span>
//   </h1>
// )

function FunctionComponent(props) {
  return (
    <h1 style={{ color: props.color }}>
      {props.name}: {props.age}
      {props.children}
    </h1>
  )
}

class ClassComponent extends React.Component {
  render() {
    return (
      <div style={{ color: this.props.color }}>
        我是 React 类组件
        {this.props.name}: {this.props.age}
        {this.props.children}
      </div>
    )
  }
}

let element = (
  <ClassComponent color="red" name="zf" age="22">
    哈哈哈
  </ClassComponent>
)

// let element2 = (
//   <FunctionComponent color="red" name="zf" age="22">
//     哈哈哈
//   </FunctionComponent>
// )

ReactDOM.render(element, document.getElementById('root'))

// root.render(Element)
