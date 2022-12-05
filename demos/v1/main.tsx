import React, { useReducer, useState, useEffect } from 'react'

import { createRoot } from 'react-dom/client'

function App() {
  const [number, setNumber] = useState(0)
  useEffect(() => {
    console.log('useEffect1')
    return () => {
      console.log('useEffect1 destroy')
    }
  }, [])

  useEffect(() => {
    console.log('useEffect2')
    return () => {
      console.log('useEffect2 destroy')
    }
  }, [])

  useEffect(() => {
    console.log('useEffect3')
    return () => {
      console.log('useEffect3 destroy')
    }
  }, [])

  return (
    <button
      onClick={() => {
        setNumber((value) => value + 1)
      }}
    >
      {number}
    </button>
  )
}

const element = <App key="app" />

createRoot(document.getElementById('root') as HTMLElement).render(element)
