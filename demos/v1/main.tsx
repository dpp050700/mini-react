import React from 'react'

import { createRoot } from 'react-dom/client'

const root = createRoot(document.getElementById('root'))

const element = <div id="container">hello world</div>

root.render(element)
