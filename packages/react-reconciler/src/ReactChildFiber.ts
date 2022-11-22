import { ReactElement } from 'shared/ReactTypes'
import { Placement } from './ReactFiberFlags'
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import {
  createFiberFromElement,
  createFiberFromText,
  FiberNode
} from './ReactFiber'

function createChildReconciler(shouldTrackSideEffects: boolean) {
  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFirstFiber: FiberNode,
    element: ReactElement
  ) {
    const created = createFiberFromElement(element)
    created.return = returnFiber
    return created
  }

  function reconcileChildrenArray(
    returnFiber: FiberNode,
    currentFirstFiber: FiberNode,
    newChildren: ReactElement[]
  ) {
    let resultingFirstChild: FiberNode = null // 返回第一个新儿子
    let previousNewFiber: FiberNode = null // 上一个新fiber
    let newIndex = 0
    for (; newIndex < newChildren.length; newIndex++) {
      const newFiber = createChild(returnFiber, newChildren[newIndex])
      if (newFiber === null) continue
      placeChild(newFiber, newIndex)
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }

      previousNewFiber = newFiber
    }
    return resultingFirstChild
  }

  function placeChild(newFiber: FiberNode, newIndex: number) {
    newFiber.index = newIndex
    if (shouldTrackSideEffects) {
      newFiber.flags |= Placement
    }
  }

  function createChild(returnFiber: FiberNode, newChild: ReactElement) {
    if (
      (typeof newChild === 'string' && newChild !== '') ||
      typeof newChild === 'number'
    ) {
      const created = createFiberFromText(`${newChild}`)
      created.return = returnFiber
      return created
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const create = createFiberFromElement(newChild)
          create.return = returnFiber
          return create
        }
        default:
          break
      }
    }
    return null
  }

  function placeSingleChild(newFiber: FiberNode) {
    if (shouldTrackSideEffects) {
      newFiber.flags |= Placement
    }
    return newFiber
  }

  function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFirstFiber: FiberNode,
    newChild: ReactElement | ReactElement[]
  ) {
    if (Object.prototype.toString.call(newChild) === '[object Object]') {
      switch ((<ReactElement>newChild).$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(
              returnFiber,
              currentFirstFiber,
              <ReactElement>newChild
            )
          )
        default:
          break
      }
    }

    if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstFiber, newChild)
    }

    return null
  }

  return reconcileChildFibers
}

export const mountChildFibers = createChildReconciler(false)

export const reconcileChildFibers = createChildReconciler(true)
