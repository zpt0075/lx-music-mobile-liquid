import { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
// import { useLayout } from '@/utils/hooks'
import { createStyle } from '@/utils/tools'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { useWindowSize } from '@/utils/hooks'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { useNavigationComponentDidAppear } from '@/navigation'
import { HEADER_HEIGHT } from './components/Header'
import Image from '@/components/common/Image'
import { useStatusbarHeight } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import commonState from '@/store/common/state'
import { Radius, getAurora, makeShadows } from '@/theme/design'


export default ({ componentId }: { componentId: string }) => {
  const musicInfo = usePlayerMusicInfo()
  const { width: winWidth, height: winHeight } = useWindowSize()
  const statusBarHeight = useStatusbarHeight()
  const theme = useTheme()
  const aurora = getAurora(theme.isDark)
  const shadows = makeShadows(theme.isDark)

  const [animated, setAnimated] = useState(!!commonState.componentIds.playDetail)
  const [pic, setPic] = useState(musicInfo.pic)
  useEffect(() => {
    if (animated) setPic(musicInfo.pic)
  }, [musicInfo.pic, animated])

  useNavigationComponentDidAppear(componentId, () => {
    setAnimated(true)
  })
  // console.log('render pic')

  const style = useMemo(() => {
    const imgWidth = Math.min(winWidth * 0.78, (winHeight - statusBarHeight - HEADER_HEIGHT) * 0.5)
    return {
      width: imgWidth,
      height: imgWidth,
      borderRadius: Radius.xl,
    }
  }, [statusBarHeight, winHeight, winWidth])

  return (
    <View style={styles.container}>
      <View style={{
        ...styles.content,
        borderRadius: Radius.xl + 4,
        borderColor: aurora.hairline,
        ...(animated ? shadows.glow : null),
      }}>
        <Image url={pic} nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_pic} style={style} />
      </View>
    </View>
  )
}

const styles = createStyle({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'rgba(0,0,0,0)',
    borderWidth: 1,
    overflow: 'hidden',
  },
})
