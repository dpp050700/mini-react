import React from 'react'

import { createRoot } from 'react-dom/client'

const root = createRoot(document.getElementById('root'))

const element = (
  <div id="container">
    hello world <span style={{ color: 'red' }}>chinese</span>
  </div>
)

console.log(element)

root.render(element)
