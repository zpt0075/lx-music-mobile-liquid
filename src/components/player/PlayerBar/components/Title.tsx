import { useEffect, useRef } from 'react'
import { Animated, Easing, TouchableOpacity } from 'react-native'
import { navigations } from '@/navigation'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { useSettingValue } from '@/store/setting/hook'
import { useTheme } from '@/store/theme/hook'
import commonState from '@/store/common/state'
import playerState from '@/store/player/state'
import Text from '@/components/common/Text'
import { LIST_IDS } from '@/config/constant'
import { createStyle, formatMusicName } from '@/utils/tools'


export default ({ isHome }: { isHome: boolean }) => {
  const musicInfo = usePlayerMusicInfo()
  const downloadFileName = useSettingValue('download.fileName')
  const theme = useTheme()
  const swap = useRef(new Animated.Value(1)).current

  // 换歌时标题做一次「下滑淡出 → 上浮淡入」，避免文字硬替换
  useEffect(() => {
    if (!musicInfo.id) return
    swap.setValue(0)
    Animated.timing(swap, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [musicInfo.id, swap])

  const handlePress = () => {
    if (!musicInfo.id) return
    navigations.pushPlayDetailScreen(commonState.componentIds.home!)
  }

  const handleLongPress = () => {
    const listId = playerState.playMusicInfo.listId
    if (!listId || listId == LIST_IDS.DOWNLOAD) return
    global.app_event.jumpListPosition()
  }

  const title = musicInfo.id
    ? musicInfo.singer
      ? formatMusicName(downloadFileName, musicInfo.name, musicInfo.singer)
      : musicInfo.name
    : ''

  return (
    <TouchableOpacity style={styles.container} onLongPress={handleLongPress} onPress={handlePress} activeOpacity={0.75} >
      <Animated.View
        style={{
          opacity: swap,
          transform: [{ translateY: swap.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        }}
      >
        <Text color={theme['c-font']} size={15} numberOfLines={1} style={{ fontWeight: '600' }}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = createStyle({
  container: {
    width: '100%',
    paddingHorizontal: 0,
  },
})
