export function initialUpdateQueue(fiber: any) {
  // 创建一个新的更新队列
  const queue: any = {
    shared: {
      pending: null
    }
  }
  fiber.updateQueue = queue
}
