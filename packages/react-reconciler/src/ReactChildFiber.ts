import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { createFiberFromElement, createFiberFromText } from './ReactFiber'
import { Placement } from './ReactFiberFlags'

/**
 *
 * @param shouldTrackSideEffects 是否跟踪副作用
 */
function createChildReconciler(shouldTrackSideEffects: boolean): any {
  function reconcileSingleElement(returnFiber: any, currentFirstFiber: any, element: any) {
    const created = createFiberFromElement(element)
    created.return = returnFiber
    return created
  }

  function reconcileChildrenArray(returnFiber: any, currentFirstFiber: any, newChildren: any) {
    let resultingFirstChild: any = null // 返回的第一个新儿子
    let previousNewFiber: any = null // 上一个新fiber
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

  function placeChild(newFiber: any, newIndex: any) {
    newFiber.index = newIndex
    if (shouldTrackSideEffects) {
      newFiber.flags |= Placement
    }
  }

  function placeSingleChild(newFiber: any) {
    if (shouldTrackSideEffects) {
      newFiber.flags |= Placement
    }
    return newFiber
  }

  function createChild(returnFiber: any, newChild: any) {
    if ((typeof newChild === 'string' && newChild !== '') || typeof newChild === 'number') {
      const created = createFiberFromText(`${newChild}`)
      created.return = returnFiber
      return created
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          const create = createFiberFromElement(newChild)
          create.return = returnFiber
          return create

        default:
          break
      }
    }
    return null
  }

  /**
   * 比较子fibers
   * @param returnFiber 新的父 fiber
   * @param currentFirstFiber 老fiber 的第一个子 fiber
   * @param newChild 新的子虚拟dom
   */
  function reconcileChildFibers(returnFiber: any, currentFirstFiber: any, newChild: any): any {
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstFiber, newChild))
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
