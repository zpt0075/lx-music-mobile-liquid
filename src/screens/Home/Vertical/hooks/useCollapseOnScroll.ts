import { useCallback, useRef } from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { setBarCollapsed } from '@/utils/playerBarMode'

// 距顶部小于这个值时一律展开，避免"想回到顶部但条已经收起来了"
const TOP_THRESHOLD = 56
// 小于这个位移量当作手指抖动，忽略
const STEP = 10

/**
 * 列表滚动 → 底部播放条收起 / 展开。
 * 往下滚（看内容）收起成左侧小圆；往上滚（回看）展开成完整播放条。
 *
 * 用法：`<FlatList {...useCollapseOnScroll()} />`（返回的就是可直接展开到列表上的 props）
 */
export default function useCollapseOnScroll() {
  const lastY = useRef(0)

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y
    const dy = y - lastY.current
    if (Math.abs(dy) < STEP) return
    lastY.current = y
    if (y <= TOP_THRESHOLD) {
      setBarCollapsed(false)
      return
    }
    setBarCollapsed(dy > 0)
  }, [])

  return { onScroll, scrollEventThrottle: 16 }
}
