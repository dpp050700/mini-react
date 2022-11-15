import { HostRoot } from './ReactWorkTags'
import { Key, Props } from 'shared/ReactTypes'
import { Flags, NoFlags } from './ReactFiberFlags'

/**
 * tag fiber 的类型， 函数组件 0、类组件 1、根节点 3、原生组件span、div  5 ...
 * pendingProps 新属性，等待处理或者生效的属性
 * 唯一标识
 */
export class FiberNode {
  tag: any = null
  key: Key
  stateNode: any = null // fiber 对应真实的 dom 节点
  type: any = null // 虚拟 dom 节点的 type
  return: any = null // 指向父节点
  child: any = null // 指向第一个子节点
  sibling: any = null // 指向弟弟
  pendingProps: Props
  memoizedProps: Props = null // 已经生效的属性
  // 每个 fiber 会有自己的状态，每一种 fiber 存的类型是不一样的
  // 类组件对应的fiber 存的就是类实例的状态， hostRoot 存的就是要渲染的元素
  memoizedState: any = null
  updateQueue: any = [] // 每个 fiber 身上可能还有更新队列
  // 副作用的标识，表示要针对此 fiber 节点进行何种操作
  flags: Flags = NoFlags
  // 子节点对应的副作用标识
  // 会将节点的 flags 冒泡的父级 的 subtreeFlags，这样 如果父节点 的 flag 和 subtreeFlags 都是 0， 那么就表示不需要更新
  subtreeFlags: Flags = NoFlags
  // 轮替
  alternate: any = null
  constructor(tag: any, pendingProps: Props, key: Key) {
    this.tag = tag
    this.key = key
    this.pendingProps = pendingProps
  }
}

export function createFiber(tag: any, pendingProps: Props, key: Key) {
  return new FiberNode(tag, pendingProps, key)
}

export function createHostRootFiber() {
  return createFiber(HostRoot, null, null)
}
