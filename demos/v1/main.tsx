import React, {useReducer, useState} from 'react'

import { createRoot } from 'react-dom/client'



function App() {
  const [number, setNumber] = useState(0)


  return number === 0 ? (
    <ul onClick={() => setNumber(number + 1)}>
      <li key='A' id='A'>A</li>
      <li key='B' id='B'>B</li>
      <li key='C' id='C'>C</li>
      <li key='D' id='D'>D</li>
      <li key='E' id='E'>E</li>
      <li key='F' id='F'>F</li>
    </ul>
  ) :  (
    <ul onClick={() => setNumber(number + 1)}>
      <li key='A' id='A'>A</li>
      <li key='C' id='C'>C</li>
      <li key='E' id='E'>E</li>
      <li key='B' id='B'>B</li>
      <li key='G' id='G'>G</li>
      <li key='D' id='D'>D</li>
    </ul>
  )

  // return number === 0 ? (
  //   <ul onClick={() => setNumber(number + 1)}>
  //     <li key='A' id='A'>A</li>
  //     <li key='B' id='B'>B</li>
  //     <li key='C' id='C'>C</li>
  //   </ul>
  // ) :  (
  //   <ul onClick={() => setNumber(number + 1)}>
  //     <li key='A' id='A'>A</li>
  //     <li key='C' id='B'>B</li>
  //   </ul>
  // )

  // return number === 0 ? (
  //   <ul onClick={() => setNumber(number + 1)}>
  //     <li key='A' id='A'>A</li>
  //     <li key='B' id='B'>B</li>
  //     <li key='C' id='C'>C</li>
  //   </ul>
  // ) :  (
  //   <ul onClick={() => setNumber(number + 1)}>
  //     <li key='A' id='A'>A</li>
  //     <li key='B' id='B'>B</li>
  //     <li key='C' id='C'>C</li>
  //     <li key='D' id='D'>D</li>
  //   </ul>
  // )


  // return number === 0 ? (
  //   <ul onClick={() => setNumber(number + 1)}>
  //     <li key='A' id='A'>A</li>
  //     <li key='B' id='B'>B</li>
  //     <li key='C' id='C'>C</li>
  //   </ul>
  // ) :  (
  //   <ul onClick={() => setNumber(number + 1)}>
  //     <li key='A' id='A2'>A2</li>
  //     <li key='B' id='B'>B</li>
  //     <li key='C' id='C2'>C2</li>
  //     <li key='D' id='D'>D</li>
  //   </ul>
  // )

  // return number === 0 ? (
  //   <div>
  //     <div key="title" id="title" onClick={() => setNumber(number + 1)}>
  //       title
  //     </div>
  //     <div key="title2" id="title2" onClick={() => setNumber(number + 1)}>
  //       title2
  //     </div>
  //   </div>
  // ) :  (
  //   <div>
  //     <p key="title" id="title" onClick={() => setNumber(number + 1)}>
  //       title
  //     </p>
  //   </div>
  // )

  // return number === 0 ? (
  //   <div>
  //     <div key="title" id="title" onClick={() => setNumber(number + 1)}>
  //       title
  //     </div>
  //     <div key="title2" id="title2" onClick={() => setNumber(number + 1)}>
  //       title2
  //     </div>
  //   </div>
  // ) :  (
  //   <div>
  //     <div key="title" id="title" onClick={() => setNumber(number + 1)}>
  //       title
  //     </div>
  //   </div>
  // )

  // return number === 0 ? (
  //   <div key="title1" id="title" onClick={() => setNumber(number + 1)}>
  //     title
  //   </div>
  // ) :  (
  //   <div key="title2" id="title2" onClick={() => setNumber(number + 1)}>
  //     title2
  //   </div>
  // )
}

// <button {...attrs} onClick={() => setNumber({type: 'add'})}><span>{ state }</span></button>

const element = <App key="app"/>

// const element = <div>111</div>

createRoot(document.getElementById('root') as HTMLElement).render(element)
