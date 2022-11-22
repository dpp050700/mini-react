import { FiberNode } from './ReactFiber'
import { HostRoot } from './ReactWorkTags'
import { FiberRootNode } from './ReactFiberRoot'

export function markUpdateLaneFromFiberToRoot(
  sourceFiber: FiberNode
): FiberRootNode {
  let node = sourceFiber
  let parent = sourceFiber.return
  while (parent !== null) {
    node = parent
    parent = parent.return
  }

  if (node.tag === HostRoot) {
    return node.stateNode
  }
  return null
}
