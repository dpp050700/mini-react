import React, {useReducer, useState} from 'react'

import { createRoot } from 'react-dom/client'


function counter(state, action) {
  console.log(state)
  if(action.type === 'add') return state + 1
  return  state
}

function App() {
  console.log('APP Render')
  const [number, setNumber] = useReducer(counter, 10)
  const [state, setState] = useState(1)
  let attrs = {id: 'btn1'}
  if(number === 1) {
    delete  attrs.id
    attrs.style = {color: 'red'}
  }
  return (
    <button {...attrs} onClick={() => setState((current) => current)}><span>{ state }</span></button>
  )
}

// <button {...attrs} onClick={() => setNumber({type: 'add'})}><span>{ state }</span></button>

const element = <App />

// const element = <div>111</div>

createRoot(document.getElementById('root') as HTMLElement).render(element)
