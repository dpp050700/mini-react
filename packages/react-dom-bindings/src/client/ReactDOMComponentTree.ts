/**
 *
 * @param targetNode
 * 从 dom 节点 获取 fiber 节点
 */

const randomKey = Math.random().toString(36).slice(2)

const internalInstanceKey = `__reactFiber$` + randomKey

const internalPropsKey = `__reactProps$` + randomKey

export function getClosestInstanceFromNode(targetNode: any) {
  const targetInst = targetNode[internalInstanceKey]
  return targetInst || null
}

export function updateFiberProps(node: any, props: any) {
  node[internalPropsKey] = props
}

export function precacheFiberNode(hostInst: any, node: any) {
  node[internalInstanceKey] = hostInst
}

export function getFiberCurrentPropsFromNode(node: any) {
  return node[internalPropsKey] || null
}
