import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { createFiberFromElement, createFiberFromText, createWorkInProgress } from './ReactFiber'
import { ChildDeletion, Placement } from './ReactFiberFlags'
import { HostText } from './ReactWorkTags'

/**
 *
 * @param shouldTrackSideEffects 是否跟踪副作用
 */
function createChildReconciler(shouldTrackSideEffects: boolean): any {
  function useFiber(fiber: any, pendingProps: any) {
    const clone = createWorkInProgress(fiber, pendingProps)
    clone.index = 0
    clone.sibling = null
    return clone
  }

  function deleteChild(returnFiber: any, childToDelete: any) {
    if (!shouldTrackSideEffects) {
      return
    }
    const deletions = returnFiber.deletions
    if (deletions === null) {
      returnFiber.deletions = [childToDelete]
      returnFiber.flags |= ChildDeletion
    } else {
      returnFiber.deletions.push(childToDelete)
    }
  }

  function deleteRemainingChildren(returnFiber: any, currentFirstChild: any): any {
    if (!shouldTrackSideEffects) {
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
      if (child.key === key) {
        if (child.type === element.type) {
          deleteRemainingChildren(returnFiber, child.sibling)
          const existing: any = useFiber(child, element.props)
          existing.return = returnFiber
          return existing
        } else {
          // 找到 key 一样，但类型不一样，不能复用
          deleteRemainingChildren(returnFiber, child)
          break
        }
      } else {
        // 如果 key 不一样，删除老节点
        deleteChild(returnFiber, child)
      }
      child = child.sibling
    }

    const created = createFiberFromElement(element)
    created.return = returnFiber
    return created
  }

  function updateElement(returnFiber: any, current: any, element: any) {
    const elementType = element.type
    if (current !== null) {
      // 判断类型是否一样
      if (current.type === elementType) {
        const existing = useFiber(current, element.props)
        existing.return = returnFiber
        return existing
      }
    }
    const created = createFiberFromElement(element)
    created.return = returnFiber
    return created
  }

  function updateSlot(returnFiber: any, oldFiber: any, newChild: any) {
    const key = oldFiber !== null ? oldFiber.key : null
    if (newChild !== null && typeof newChild === 'object') {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          if (newChild.key === key) {
            return updateElement(returnFiber, oldFiber, newChild)
          }
          return null
        }
        default:
          return null
      }
    }
    return null
  }

  function mapRemainingChildren(returnFiber: any, currentFirstChild: any) {
    const existingChildren = new Map()
    let existingChild = currentFirstChild
    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild)
      } else {
        existingChildren.set(existingChild.index, existingChild)
      }
      existingChild = existingChild.sibling
    }
    return existingChildren
  }

  function updateTextNode(returnFiber: any, current: any, textContent: any) {
    if (current === null || current.tag !== HostText) {
      const created = createFiberFromText(textContent)
      created.return = returnFiber
      return created
    } else {
      const existing = useFiber(current, textContent)
      existing.return = returnFiber
      return existing
    }
  }

  function updateFromMap(existingChildren: any, returnFiber: any, newIndex: any, newChild: any) {
    if ((typeof newChild === 'string' && newChild !== '') || typeof newChild === 'number') {
      const matchedFiber = existingChildren.get(newIndex) || null
      return updateTextNode(returnFiber, matchedFiber, '' + newChild)
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const matchedFiber = existingChildren.get(newChild.key === null ? newIndex : newChild.key) || null
          return updateElement(returnFiber, matchedFiber, newChild)
        }
      }
    }
  }

  function reconcileChildrenArray(returnFiber: any, currentFirstChild: any, newChildren: any) {
    let resultingFirstChild: any = null // 用来记录第一个新儿子
    let previousNewFiber: any = null // 上一个新fiber
    let newIndex = 0
    let oldFiber = currentFirstChild
    let nextOldFiber = null
    let lastPlacedIndex = 0 // 上一次不要移动的老节点的索引

    // 开始第一轮循环
    for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
      nextOldFiber = oldFiber.sibling
      // 试图更新或者试图复用老 fiber
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex])
      if (newFiber === null) {
        break
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // 没有成功复用老的 fiber, 那就删除 老 fiber
          deleteChild(returnFiber, oldFiber)
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex)
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
      oldFiber = nextOldFiber
    }

    // 新的虚拟 DOM 已经循环完毕
    if (newIndex === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber)
      return resultingFirstChild
    }

    if (oldFiber === null) {
      for (; newIndex < newChildren.length; newIndex++) {
        const newFiber = createChild(returnFiber, newChildren[newIndex])
        if (newFiber === null) continue
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex)
        // 如果上一个新 fiber 是空，说明还没有大儿子，此时给大儿子赋值、给上一个新fiber 赋值
        // 有上一个新fiber，说明已经有了 大儿子，此时给上一个fiber 的 sibling 赋值，建立兄弟关系
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber
        } else {
          previousNewFiber.sibling = newFiber
        }

        previousNewFiber = newFiber
      }
    }

    /**
     * 开始处理移动的情况
     */
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber)
    // 开始遍历剩下的虚拟 DOM 子节点
    for (; newIndex < newChildren.length; newIndex++) {
      const newFiber = updateFromMap(existingChildren, returnFiber, newIndex, newChildren[newIndex])
      if (newFiber !== null) {
        if (shouldTrackSideEffects) {
          // 要跟踪副作用，且有老 fiber
          if (newFiber.alternate !== null) {
            existingChildren.delete(newFiber.key === null ? newIndex : newFiber.key)
          }
        }
        // 指定新的 fiber 的位置
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex)

        if (previousNewFiber === null) {
          resultingFirstChild = newFiber
        } else {
          previousNewFiber.sibling = newFiber
        }

        previousNewFiber = newFiber
      }
    }

    if (shouldTrackSideEffects) {
      // 删除 map 中所有剩下的老fiber
      existingChildren.forEach((child) => deleteChild(returnFiber, child))
    }

    return resultingFirstChild
  }

  function placeChild(newFiber: any, lastPlacedIndex: any, newIndex: any) {
    // 指定新的fiber 在新的挂载索引
    newFiber.index = newIndex
    if (!shouldTrackSideEffects) {
      return lastPlacedIndex
    }
    // 获取老fiber
    const current = newFiber.alternate
    // 如果有，说明这是一个更新的节点，有老的 DOM
    if (current !== null) {
      const oldIndex = current.index
      // 如果找到的老 fiber 的索引比 lastPlacedIndex 小，则老 fiber 对应的DOM 节点需要移动
      if (oldIndex < lastPlacedIndex) {
        newFiber.flags |= Placement
        return lastPlacedIndex
      } else {
        return oldIndex
      }
    } else {
      newFiber.flags |= Placement
      return lastPlacedIndex
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
