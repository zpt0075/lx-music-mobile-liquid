import { memo, useEffect, useRef } from 'react'
import { Animated, Easing, TouchableOpacity, View } from 'react-native'
import Image from '@/components/common/Image'
import { Icon } from '@/components/common/Icon'
import { useTheme } from '@/store/theme/hook'
import { useIsPlay, usePlayerMusicInfo } from '@/store/player/hook'

export const MINI_SIZE = 46
const SPIN_DURATION = 12000

/**
 * 收起态的小圆：封面 + 右下角播放/暂停指示。
 *
 * 播放中封面缓慢自转（黑胶那种"在转"的感觉），暂停时停住；
 * 右下角的按键只是状态指示（不再用蓝色实心大圆抢视线），点整圆展开播放条。
 */
export default memo(({ visible, onPress }: { visible: boolean, onPress: () => void }) => {
  const theme = useTheme()
  const musicInfo = usePlayerMusicInfo()
  const isPlay = useIsPlay()
  const enter = useRef(new Animated.Value(0)).current
  const spin = useRef(new Animated.Value(0)).current
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    Animated.spring(enter, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      damping: 14,
      stiffness: 220,
      mass: 0.7,
    }).start()
  }, [visible, enter])

  // 播放中才转；暂停时停住（保留当前角度，不回到 0）
  useEffect(() => {
    if (!visible || !isPlay) {
      spinLoop.current?.stop()
      spinLoop.current = null
      return
    }
    spinLoop.current = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: SPIN_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    spinLoop.current.start()
    return () => {
      spinLoop.current?.stop()
      spinLoop.current = null
      spin.setValue(0)
    }
  }, [visible, isPlay, spin])

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
        transform: [{ scale: enter }],
        opacity: enter,
      }}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        <View style={{
          width: MINI_SIZE,
          height: MINI_SIZE,
          borderRadius: MINI_SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.05)',
        }}>
          {/* 转的是封面本体，外圈边框与角标保持不动 */}
          <Animated.View style={{
            width: MINI_SIZE - 4,
            height: MINI_SIZE - 4,
            borderRadius: (MINI_SIZE - 4) / 2,
            overflow: 'hidden',
            transform: [{
              rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
            }],
          }}>
            <Image url={musicInfo.pic} style={{ width: '100%', height: '100%' }} />
          </Animated.View>
          <View style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 16,
            height: 16,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.isDark ? 'rgba(20,20,26,0.72)' : 'rgba(255,255,255,0.92)',
          }}>
            <Icon name={isPlay ? 'pause' : 'play'} color={theme['c-font']} size={8} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
})
