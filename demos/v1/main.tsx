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

  // useEffect(() => {
  //   console.log('useEffect2')
  //   return () => {
  //     console.log('useEffect2 destroy')
  //   }
  // }, [])

  // useEffect(() => {
  //   console.log('useEffect3')
  //   return () => {
  //     console.log('useEffect3 destroy')
  //   }
  // }, [])

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

/**
 * TODO 这种场景多切换两次就出bug
 * @returns
 */
function Container() {
  const [number, setNumber] = useState(0)
  return (
    <div>
      {/* 这边不用 span 包裹 number 就不会更新 */}
      <span>{number}</span>
      {/* 这边 App 换成 span 多次点击会有 bug */}
      {number % 2 === 0 ? <App key="app" /> : <span key="hello">hello</span>}
      <button
        onClick={() => {
          setNumber((value) => value + 1)
        }}
      >
        {number}
      </button>
    </div>
  )
}

const element = <App key="app" />
// const element = <Container />

createRoot(document.getElementById('root') as HTMLElement).render(element)
