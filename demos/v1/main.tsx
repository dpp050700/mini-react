import React from 'react'

import { createRoot } from 'react-dom/client'

function App() {
  return (
    <h1 onClick={() => console.log('parent Bubble')} onClickCapture={(e) => console.log(e.currentTarget)}>
      <span onClick={() => console.log('child Bubble')} onClickCapture={(e) => console.log(e.currentTarget)}>
        world
      </span>
    </h1>
  )
}

const element = <App />

createRoot(document.getElementById('root') as HTMLElement).render(element)
