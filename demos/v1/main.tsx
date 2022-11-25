import React, {useReducer} from 'react'

import { createRoot } from 'react-dom/client'


function counter(state, action) {
  if(action.type === 'add') return state + 1
  return  state
}

function App() {

  const [number, setNumber] = useReducer(counter, 0)
  return (
    <button onClick={() => setNumber({type: 'add'})}>{ number }</button>
  )
}

const element = <App />

createRoot(document.getElementById('root') as HTMLElement).render(element)
