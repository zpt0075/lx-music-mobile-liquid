import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, View } from 'react-native'
import Content from './Content'
import GlassTabBar from './components/GlassTabBar'
import PlayerBar from '@/components/player/PlayerBar'
import { useTheme } from '@/store/theme/hook'
import { useSettingValue } from '@/store/setting/hook'
import { useKeyboard } from '@/utils/hooks'
import { getBarCollapsed, setBarCollapsed, subscribeBarCollapsed } from '@/utils/playerBarMode'

// 玻璃标签栏占位高度（bar 62 + 上 4 + 下 14）
const TAB_BAR_HEIGHT = 80

/**
 * 首页布局：
 *   · 播放条与玻璃标签栏都**悬浮**在内容之上（标签栏只留一块等高的占位），
 *     列表 / 封面会从两块玻璃下面滑过 → 原生 LiquidGlassView 才能真的采样到背景做折射和模糊
 *   · 列表往下滚时播放条收起成左侧小圆（鸿蒙音乐那种），往上滚再展开
 */
export default () => {
  const theme = useTheme()
  const autoHidePlayBar = useSettingValue('common.autoHidePlayBar')
  const { keyboardShown } = useKeyboard()
  const hideBar = autoHidePlayBar && keyboardShown

  const [collapsed, setCollapsed] = useState(getBarCollapsed)
  // 播放条收起：整体缩小并向左侧小圆的位置收拢，然后不再占位响应点击
  const shrink = useRef(new Animated.Value(collapsed ? 1 : 0)).current

  useEffect(() => subscribeBarCollapsed(setCollapsed), [])

  useEffect(() => {
    Animated.timing(shrink, {
      toValue: collapsed ? 1 : 0,
      duration: collapsed ? 280 : 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [collapsed, shrink])

  const handleExpand = () => { setBarCollapsed(false) }

  return (
    <View style={{ flex: 1, backgroundColor: theme['c-app-background'] }}>
      <Content />
      <View style={styles.bars} pointerEvents={collapsed ? 'none' : 'box-none'}>
        {hideBar
          ? null
          : (
            <Animated.View style={{
              opacity: shrink.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.6, 0] }),
              transform: [
                { scale: shrink.interpolate({ inputRange: [0, 1], outputRange: [1, 0.22] }) },
                { translateX: shrink.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) },
                { translateY: shrink.interpolate({ inputRange: [0, 1], outputRange: [0, 62] }) },
              ],
            }}>
              <PlayerBar isHome />
            </Animated.View>
          )}
      </View>
      <View style={styles.tabBar} pointerEvents='box-none'>
        <GlassTabBar collapsed={collapsed} onExpand={handleExpand} />
      </View>
    </View>
  )
}

const styles = {
  bars: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT,
  },
  tabBar: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
  },
}
