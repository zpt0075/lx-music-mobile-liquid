import { memo, useState, useRef, useMemo, useEffect } from 'react'
import { View, AppState, StyleSheet, Image as RNImage } from 'react-native'

import Header from './components/Header'
// import Aside from './components/Aside'
// import Main from './components/Main'
import Player from './Player'
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view'
import Pic from './Pic'
import Lyric from './Lyric'
import { screenkeepAwake, screenUnkeepAwake } from '@/utils/nativeModules/utils'
import commonState, { type InitState as CommonState } from '@/store/common/state'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { Glow } from '@/components/common/Gradient'
import { getAurora } from '@/theme/design'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { useSettingValue } from '@/store/setting/hook'

const LyricPage = ({ activeIndex }: { activeIndex: number }) => {
  const initedRef = useRef(false)
  const lyric = useMemo(() => <Lyric />, [])
  switch (activeIndex) {
    // case 3:
    case 1:
      if (!initedRef.current) initedRef.current = true
      return lyric
    default:
      return initedRef.current ? lyric : null
  }
  // return activeIndex == 0 || activeIndex == 1 ? setting : null
}

// global.iskeep = false
export default memo(({ componentId }: { componentId: string }) => {
  const theme = useTheme()
  const aurora = getAurora(theme.isDark)
  const musicInfo = usePlayerMusicInfo()
  // 动态背景开关：关掉时把封面铺底降成很淡的一层，仍然跟封面同色系，不至于变成一块死白
  const dynamicBg = useSettingValue('theme.dynamicBg')
  const [pageIndex, setPageIndex] = useState(0)
  const showLyricRef = useRef(false)

  const onPageSelected = ({ nativeEvent }: PagerViewOnPageSelectedEvent) => {
    setPageIndex(nativeEvent.position)
    showLyricRef.current = nativeEvent.position == 1
    if (showLyricRef.current) {
      screenkeepAwake()
    } else {
      screenUnkeepAwake()
    }
  }

  useEffect(() => {
    let appstateListener = AppState.addEventListener('change', (state) => {
      switch (state) {
        case 'active':
          if (showLyricRef.current && !commonState.componentIds.comment) screenkeepAwake()
          break
        case 'background':
          screenUnkeepAwake()
          break
      }
    })

    const handleComponentIdsChange = (ids: CommonState['componentIds']) => {
      if (ids.comment) screenUnkeepAwake()
      else if (AppState.currentState == 'active') screenkeepAwake()
    }

    global.state_event.on('componentIdsUpdated', handleComponentIdsChange)

    return () => {
      global.state_event.off('componentIdsUpdated', handleComponentIdsChange)
      appstateListener.remove()
      screenUnkeepAwake()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Header />
      <View style={{ ...styles.container, backgroundColor: theme['c-main-background'] }}>
        {/* 动态背景：跟随当前封面做模糊铺底，歌词页不再是干巴巴的纯色 */}
        {musicInfo.pic
          ? <RNImage
            source={{ uri: musicInfo.pic }}
            blurRadius={60}
            style={[StyleSheet.absoluteFill, { opacity: dynamicBg ? 1 : 0.45 }]}
          />
          : null}
        <View
          pointerEvents='none'
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.isDark
              ? (dynamicBg ? 'rgba(10, 10, 14, 0.74)' : 'rgba(10, 10, 14, 0.86)')
              : (dynamicBg ? 'rgba(255, 255, 255, 0.78)' : 'rgba(255, 255, 255, 0.90)') },
          ]}
        />
        <Glow color={aurora.glowPrimary} size={380} style={{ top: -140, right: -130 }} />
        <Glow color={aurora.glowSecondary} size={340} style={{ bottom: 40, left: -150 }} />
        <PagerView
          onPageSelected={onPageSelected}
          // onPageScrollStateChanged={onPageScrollStateChanged}
          style={styles.pagerView}
        >
          <View collapsable={false}>
            <Pic componentId={componentId} />
          </View>
          <View collapsable={false}>
            <LyricPage activeIndex={pageIndex} />
          </View>
        </PagerView>
        {/* <View style={styles.pageIndicator} nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_pageIndicator}>
          <View style={{ ...styles.pageIndicatorItem, backgroundColor: pageIndex == 0 ? theme['c-primary-light-100-alpha-700'] : theme['c-primary-alpha-900'] }}></View>
          <View style={{ ...styles.pageIndicatorItem, backgroundColor: pageIndex == 1 ? theme['c-primary-light-100-alpha-700'] : theme['c-primary-alpha-900'] }}></View>
        </View> */}
        <Player />
      </View>
    </>
  )
})

const styles = createStyle({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  pagerView: {
    flex: 1,
  },
  // pageIndicator: {
  //   flex: 0,
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   paddingTop: 10,
  //   // backgroundColor: 'rgba(0,0,0,0.1)',
  // },
  // pageIndicatorItem: {
  //   height: 3,
  //   width: '5%',
  //   marginLeft: 2,
  //   marginRight: 2,
  //   borderRadius: 2,
  // },
})
