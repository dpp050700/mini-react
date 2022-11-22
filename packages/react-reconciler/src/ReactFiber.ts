import {
  HostRoot,
  IndeterminateComponent,
  WorkTag,
  HostComponent,
  HostText
} from './ReactWorkTags'
import { ElementType, Key, Props, ReactElement, Ref } from 'shared/ReactTypes'
import { Flags, NoFlags } from './ReactFiberFlags'
import { UpdateQueue } from './ReactFiberClassUpdateQueue'

export class FiberNode {
  tag: WorkTag = null
  key: Key = null
  type: ElementType = null
  stateNode: any = null
  ref: Ref
  pendingProps: Props = null

  // 已经生效的属性
  memoizedProps: Props = null

  child: FiberNode | null = null
  sibling: FiberNode | null = null
  return: FiberNode | null = null

  flags: Flags = null
  subtreeFlags: Flags = null

  updateQueue: UpdateQueue = null

  memoizedState: any = null

  alternate: FiberNode = null

  index: number = null

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.tag = tag
    this.pendingProps = pendingProps
    this.key = key
  }
}

export function createFiber(tag: WorkTag, pendingProps: Props, key: Key) {
  return new FiberNode(tag, pendingProps, key)
}

export function createHostRootFiber() {
  return createFiber(HostRoot, null, null)
}

export function createWorkInProgress(current: FiberNode, pendingProps: Props) {
  let workInProgress = current.alternate
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key)
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    workInProgress.pendingProps = pendingProps
    workInProgress.type = current.type
    workInProgress.flags = NoFlags
    workInProgress.subtreeFlags = NoFlags
  }
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue
  workInProgress.sibling = current.sibling
  workInProgress.index = current.index

  return workInProgress
}

export function createFiberFromElement(element: ReactElement) {
  const { type, key, props: pendingProps } = element
  return createFiberFromTypeAndProps(type, key, pendingProps)
}

function createFiberFromTypeAndProps(
  type: ElementType,
  key: Key,
  pendingProps: Props
) {
  let tag: WorkTag = IndeterminateComponent
  if (typeof type === 'string') {
    tag = HostComponent
  }
  const fiber = createFiber(tag, pendingProps, key)
  fiber.type = type
  return fiber
}

export function createFiberFromText(content: Props): FiberNode {
  const fiber = createFiber(HostText, content, null)
  return fiber
}
