import { StyleSheet, TouchableOpacity, View, Animated, Easing } from 'react-native'
import { navigations } from '@/navigation'
import { useIsPlay, usePlayerMusicInfo } from '@/store/player/hook'
import { scaleSizeH } from '@/utils/pixelRatio'
import commonState from '@/store/common/state'
import playerState from '@/store/player/state'
import { LIST_IDS, NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import Image from '@/components/common/Image'
import { useCallback, useEffect, useRef } from 'react'
import { setLoadErrorPicUrl, setMusicInfo } from '@/core/player/playInfo'
import { useTheme } from '@/store/theme/hook'
import { getAurora } from '@/theme/design'

const PIC_SIZE = Math.round(scaleSizeH(46))
// 一圈 12s，跟左侧收起态的小圆同一个转速，视觉上是一套东西
const SPIN_DURATION = 12000

const styles = StyleSheet.create({
  wrap: {
    width: PIC_SIZE,
    height: PIC_SIZE,
    // 圆形封面：转动时不会出现方角被裁掉的破面，也和收起态的小圆是同一形状
    borderRadius: PIC_SIZE / 2,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
})

export default ({ isHome }: { isHome: boolean }) => {
  const musicInfo = usePlayerMusicInfo()
  const isPlay = useIsPlay()
  const theme = useTheme()
  const aurora = getAurora(theme.isDark)
  const spin = useRef(new Animated.Value(0)).current
  const loopRef = useRef<Animated.CompositeAnimation | null>(null)

  // 播放时封面缓慢自转；暂停停在当前角度（和收起态小圆一致）
  useEffect(() => {
    loopRef.current?.stop()
    if (!isPlay || !musicInfo.pic) return
    loopRef.current = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: SPIN_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    loopRef.current.start()
    return () => { loopRef.current?.stop() }
  }, [isPlay, musicInfo.pic, spin])

  const handlePress = () => {
    if (!musicInfo.id) return
    navigations.pushPlayDetailScreen(commonState.componentIds.home!)
  }

  const handleLongPress = () => {
    if (!isHome) return
    const listId = playerState.playMusicInfo.listId
    if (!listId || listId == LIST_IDS.DOWNLOAD) return
    global.app_event.jumpListPosition()
  }

  const handleError = useCallback((url: string | number) => {
    setLoadErrorPicUrl(url as string)
    setMusicInfo({
      pic: null,
    })
  }, [])

  return (
    <TouchableOpacity onLongPress={handleLongPress} onPress={handlePress} activeOpacity={0.75} >
      <View style={[styles.wrap, { borderColor: aurora.hairline, backgroundColor: aurora.glass }]}>
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            transform: [{
              rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
            }],
          }}
        >
          <Image url={musicInfo.pic} nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_pic} style={styles.image} onError={handleError} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  )
}
