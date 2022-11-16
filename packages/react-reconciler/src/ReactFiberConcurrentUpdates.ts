import { HostRoot } from './ReactWorkTags'

export function markUpdateLaneFromFiberToRoot(sourceFiber: any) {
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
