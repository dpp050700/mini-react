import React from 'react'

import ReactDOM from 'react-dom/client'

function App() {
  return <div>11</div>
}

// ReactDOM.render(<div>222</div>, document.getElementById('root'))

// import ReactDOM from 'react-dom/client'
// import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<div>222</div>)
