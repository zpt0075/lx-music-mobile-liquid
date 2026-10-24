import { View } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import { useNavActiveId, useStatusbarHeight } from '@/store/common/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import StatusBar from '@/components/common/StatusBar'
import LiquidGlass from '@/components/common/LiquidGlass'
import { scaleSizeH } from '@/utils/pixelRatio'
import { HEADER_HEIGHT } from '@/config/constant'
import { type InitState as CommonState } from '@/store/common/state'
import SearchTypeSelector from '@/screens/Home/Views/Search/SearchTypeSelector'
import { FontWeight, Radius } from '@/theme/design'

const headerComponents: Partial<Record<CommonState['navActiveId'], React.ReactNode>> = {
  nav_search: <SearchTypeSelector />,
}

/**
 * 顶部标题栏：**整条都是一块玻璃**——从屏幕最顶端（含状态栏那一大片）一直铺到标题下方，
 * 不再是"白底 + 小胶囊"，而是和底部两条玻璃栏同一种材质的整幅玻璃带。
 */
const TitleRow = () => {
  const theme = useTheme()
  const id = useNavActiveId()
  const t = useI18n()
  const statusBarHeight = useStatusbarHeight()
  const height = statusBarHeight + scaleSizeH(HEADER_HEIGHT)

  return (
    <View style={{ height }}>
      <LiquidGlass
        radius={0}
        isDark={theme.isDark}
        scrim={theme.isDark ? 0.30 : 0.26}
        style={styles.glass}
      />
      <View style={[styles.container, { paddingTop: statusBarHeight }]}>
        <View style={styles.left}>
          <View style={[styles.accentMark, { backgroundColor: theme['c-primary'] }]} />
          <Text style={styles.title} size={20} color={theme['c-font']}>{t(id)}</Text>
        </View>
        {headerComponents[id] ?? null}
      </View>
      <View style={[styles.hairline, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(17,17,17,0.07)' }]} />
    </View>
  )
}

const Header = () => {
  // 侧边抽屉已移除：标题统一左对齐，不再需要菜单按钮
  return (
    <>
      <StatusBar />
      <TitleRow />
    </>
  )
}


const styles = createStyle({
  glass: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  accentMark: {
    width: 4,
    height: 18,
    borderRadius: Radius.xs,
    marginRight: 10,
  },
  title: {
    fontWeight: FontWeight.semibold,
  },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    opacity: 0.6,
  },
})

export default Header
