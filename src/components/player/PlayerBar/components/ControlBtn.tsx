import { TouchableOpacity } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { useIsPlay } from '@/store/player/hook'
import { useTheme } from '@/store/theme/hook'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { createStyle } from '@/utils/tools'
import { useHorizontalMode } from '@/utils/hooks'

const BTN_SIZE = 26

const handlePlayPrev = () => {
  void playPrev()
}
const handlePlayNext = () => {
  void playNext()
}

const PlayPrevBtn = () => {
  const theme = useTheme()
  return (
    <TouchableOpacity style={styles.controlBtn} activeOpacity={0.6} onPress={handlePlayPrev}>
      <Icon name='prevMusic' color={theme['c-font']} size={22} />
    </TouchableOpacity>
  )
}

const PlayNextBtn = () => {
  const theme = useTheme()
  return (
    <TouchableOpacity style={styles.controlBtn} activeOpacity={0.6} onPress={handlePlayNext}>
      <Icon name='nextMusic' color={theme['c-font']} size={22} />
    </TouchableOpacity>
  )
}

// 纯图标：去掉原来的渐变蓝色圆底，只留一个干净的播放/暂停键
const TogglePlayBtn = () => {
  const isPlay = useIsPlay()
  const theme = useTheme()
  return (
    <TouchableOpacity style={styles.controlBtn} activeOpacity={0.55} onPress={togglePlay}>
      <Icon name={isPlay ? 'pause' : 'play'} color={theme['c-font']} size={BTN_SIZE} />
    </TouchableOpacity>
  )
}

export default () => {
  const isHorizontalMode = useHorizontalMode()
  return (
    <>
      { isHorizontalMode ? <PlayPrevBtn /> : null }
      <TogglePlayBtn />
      <PlayNextBtn />
    </>
  )
}


const styles = createStyle({
  controlBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
