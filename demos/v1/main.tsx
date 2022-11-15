import React from 'react'

import { createRoot } from 'react-dom/client'

function App() {
  return <div>11</div>
}

const element = <div>222</div>

// ReactDOM.render(<div>222</div>, document.getElementById('root'))

// import ReactDOM from 'react-dom/client'
// import App from './App'

createRoot(document.getElementById('root') as HTMLElement).render(element)
