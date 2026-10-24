/**
 * 播放条"收起成小圆"的全局状态。
 *
 * 为什么不用 store：滚动事件每秒几十次，走 redux 那套会让整个设置/列表树重渲染；
 * 这里只用一个模块级布尔 + 订阅集合，谁关心谁订阅（目前只有首页的播放条和玻璃标签栏）。
 */
type Listener = (collapsed: boolean) => void

let collapsed = false
const listeners = new Set<Listener>()

export const getBarCollapsed = () => collapsed

export const setBarCollapsed = (value: boolean) => {
  if (collapsed === value) return
  collapsed = value
  listeners.forEach(handle => { handle(value) })
}

/** 订阅收起状态变化，返回取消订阅函数 */
export const subscribeBarCollapsed = (listener: Listener) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
