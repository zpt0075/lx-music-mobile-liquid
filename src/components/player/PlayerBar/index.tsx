import { memo, useEffect, useMemo, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'
import { useKeyboard } from '@/utils/hooks'

import Pic from './components/Pic'
import Title from './components/Title'
import PlayInfo from './components/PlayInfo'
import ControlBtn from './components/ControlBtn'
import LiquidGlass from '@/components/common/LiquidGlass'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { useSettingValue } from '@/store/setting/hook'
import { useIsPlay } from '@/store/player/hook'
import { Radius } from '@/theme/design'


export default memo(({ isHome = false }: { isHome?: boolean }) => {
  const { keyboardShown } = useKeyboard()
  const theme = useTheme()
  const autoHidePlayBar = useSettingValue('common.autoHidePlayBar')
  const isDark = theme.isDark
  const isPlay = useIsPlay()

  // 播放条入场：自下而上浮入（鸿蒙音乐那种轻量"弹一下"）
  const enter = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [enter])

  const playerComponent = useMemo(() => (
    <Animated.View
      style={[styles.wrap, {
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
      }]}
    >
      <LiquidGlass radius={Radius.xl} isDark={isDark} edge={18} style={styles.card}>
        <Pic isHome={isHome} />
        <View style={styles.center}>
          <Title isHome={isHome} />
          <PlayInfo isHome={isHome} />
        </View>
        <View style={styles.right}>
          <ControlBtn />
        </View>
      </LiquidGlass>
    </Animated.View>
  ), [theme, isHome, isDark, enter, isPlay])

  return autoHidePlayBar && keyboardShown ? null : playerComponent
})


const styles = createStyle({
  wrap: {
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 2,
  },
  card: {
    width: '100%',
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 4,
    overflow: 'hidden',
  },
  center: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 0,
    paddingLeft: 4,
    paddingRight: 4,
  },
})
