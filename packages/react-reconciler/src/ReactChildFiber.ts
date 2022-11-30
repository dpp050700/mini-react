import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import {createFiberFromElement, createFiberFromText, createWorkInProgress} from './ReactFiber'
import {ChildDeletion, Placement} from './ReactFiberFlags'

/**
 *
 * @param shouldTrackSideEffects 是否跟踪副作用
 */
function createChildReconciler(shouldTrackSideEffects: boolean): any {

  function useFiber(fiber:any, pendingProps:any) {
    const clone = createWorkInProgress(fiber, pendingProps)
    clone.index = 0
    clone.sibling = null
    return clone
  }

  function deleteChild(returnFiber:any, childToDelete:any){
    if(!shouldTrackSideEffects) {
      return
    }
    const deletions = returnFiber.deletions
    if(deletions === null) {
      returnFiber.deletions = [childToDelete]
      returnFiber.flags |= ChildDeletion
    }else {
      returnFiber.deletions.push(childToDelete)
    }
  }

  function deleteRemainingChildren(returnFiber:any, currentFirstChild:any) {
    if(!shouldTrackSideEffects) {
      return
    }
    let childToDelete = currentFirstChild

    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete)
      childToDelete = childToDelete.sibling
    }
    return null
  }

  /**
   * 单节点的情况
   * @param returnFiber
   * @param currentFirstChild
   * @param element
   */
  function reconcileSingleElement(returnFiber: any, currentFirstChild: any, element: any) {

    const key = element.key
    let child = currentFirstChild

    while (child !== null) {
      if(child.key === key){
        if(child.type === element.type) {
          deleteRemainingChildren(returnFiber, child.sibling)
          const existing: any = useFiber(child, element.props)
          existing.return = returnFiber
          return  existing
        }else {
          // 找到 key 一样，但类型不一样，不能复用
          deleteRemainingChildren(returnFiber, child)
          break
        }
      }else {
        // 如果 key 不一样，删除老节点
        deleteChild(returnFiber, child)
      }
      child = child.sibling
    }

    const created = createFiberFromElement(element)
    created.return = returnFiber
    return created
  }

  function updateElement(returnFiber: any, current: any, element: any){
    const elementType = element.type
    if(current !== null) {
      // 判断类型是否一样
      if(current.type === elementType) {
        const existing =  useFiber(current, element.props)
        existing.return = returnFiber
        return existing
      }
    }
    const created = createFiberFromElement(element)
    created.return = returnFiber
    return  created
  }

  function updateSlot(returnFiber: any, oldFiber: any, newChild: any) {
    const key = oldFiber !== null ? oldFiber.key : null
    if(newChild !== null && typeof  newChild === 'object') {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          if(newChild.key === key) {
            return updateElement(returnFiber, oldFiber, newChild)
          }
          return null
        }
        default:
          return null
      }
    }
  }

  function reconcileChildrenArray(returnFiber: any, currentFirstChild: any, newChildren: any) {
    let resultingFirstChild: any = null // 返回的第一个新儿子
    let previousNewFiber: any = null // 上一个新fiber
    let newIndex = 0
    let oldFiber = currentFirstChild
    let nextOldFiber = null

    // 开始第一轮循环
    for(; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
      nextOldFiber = oldFiber.sibling
      // 试图更新或者试图复用老 fiber
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex])
      if(newFiber === null) {
        break
      }
      if(shouldTrackSideEffects) {
        if(oldFiber && newFiber.alternate === null) {
          // 没有成功复用老的 fiber, 那就删除 老 fiber
          deleteChild(returnFiber, oldFiber)
        }
      }
      placeChild(newFiber, newIndex)
      if(previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
      oldFiber = nextOldFiber
    }

    // 新的虚拟 DOM 已经循环完毕
    if(newIndex === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber)
      return resultingFirstChild
    }

    if(oldFiber === null) {
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
    }


    return resultingFirstChild
  }

  function placeChild(newFiber: any, newIndex: any) {
    // 指定新的fiber 在新的挂载索引
    newFiber.index = newIndex
    if (!shouldTrackSideEffects) {
      return
    }
    // 获取老fiber
    const current = newFiber.alternate
    // 如果有，说明这是一个更新的节点，有老的 DOM
    if(current !== null) {
      return;
    } else {
      newFiber.flags |= Placement
    }
  }

  function placeSingleChild(newFiber: any) {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
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
   * @param currentFirstChild 老fiber 的第一个子 fiber
   * @param newChild 新的子虚拟dom
   */
  function reconcileChildFibers(returnFiber: any, currentFirstChild: any, newChild: any): any {
    // 处理更新逻辑 dom-diff
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild))
        default:
          break
      }
    }
    if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild)
    }

    return null
  }

  return reconcileChildFibers
}

export const mountChildFibers = createChildReconciler(false)

export const reconcileChildFibers = createChildReconciler(true)
