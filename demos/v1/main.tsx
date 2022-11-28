import React, {useReducer} from 'react'

import { createRoot } from 'react-dom/client'


function counter(state, action) {
  if(action.type === 'add') return state + 1
  return  state
}

function App() {
  const [number, setNumber] = useReducer(counter, 0)
  let attrs = {id: 'btn1'}
  if(number === 1) {
    delete  attrs.id
    attrs.style = {color: 'red'}
  }
  return (
    <button {...attrs} onClick={() => setNumber({type: 'add'})}>{ number }</button>
  )
}

const element = <App />

// const element = <div>111</div>

createRoot(document.getElementById('root') as HTMLElement).render(element)
