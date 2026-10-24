import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Animated, PanResponder, TouchableOpacity, View, Easing } from 'react-native'
import { useNavActiveId } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import { useI18n } from '@/lang'
import { NAV_MENUS } from '@/config/constant'
import type { NAV_ID_Type } from '@/config/constant'
import { setNavActiveId } from '@/core/common'
import LiquidGlass from '@/components/common/LiquidGlass'
import MiniPlayer, { MINI_SIZE } from './MiniPlayer'
import { setBarCollapsed } from '@/utils/playerBarMode'
import { createStyle } from '@/utils/tools'
import { Radius, Spacing } from '@/theme/design'
import type { InitState } from '@/store/common/state'

const INDICATOR_H = 52
const BAR_HEIGHT = 68
// 收起态时为左侧小圆让出的宽度（12 左边距 + 46 圆 + 14 间隙）
const MINI_SLOT = 74
const ICON_SIZE = 23
// 拖动时超过这个位移才"抓起来"，否则当作点击交给 TouchableOpacity
const DRAG_START = 8

/**
 * 玻璃底部标签栏（Liquid Glass）
 *
 * - 只有图标，高度 60，尽量"消失"在内容里；
 * - 选中态是一枚**玻璃薄片**，可以**按住左右拖动**：薄片跟着手指走、微微放大，
 *   松手后吸附到手指所在的那一格并切页（小红书那种"拖着走"的手感）；
 * - 收起态：右侧菜单整体让位给左侧小圆，小圆与菜单同处一块玻璃内。
 */
export default memo(({ collapsed = false, onExpand }: { collapsed?: boolean, onExpand?: () => void }) => {
  const theme = useTheme()
  const activeId = useNavActiveId()
  const t = useI18n()
  const isDark = theme.isDark

  const [rowWidth, setRowWidth] = useState(0)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [pressedIndex, setPressedIndex] = useState<number | null>(null)

  const itemWidth = rowWidth > 0 ? rowWidth / NAV_MENUS.length : 0
  const activeIndex = Math.max(0, NAV_MENUS.findIndex(menu => menu.id === activeId))
  const displayIndex = dragIndex ?? activeIndex

  // 薄片位置用像素驱动（拖动时要 setValue，所以只能走 JS driver）
  const posX = useRef(new Animated.Value(0)).current
  const lift = useRef(new Animated.Value(0)).current
  const enter = useRef(new Animated.Value(0)).current
  const compact = useRef(new Animated.Value(0)).current

  // PanResponder 只创建一次，用 ref 拿最新值
  const activeIndexRef = useRef(activeIndex)
  const itemWidthRef = useRef(itemWidth)
  const hoverRef = useRef<number | null>(null)
  activeIndexRef.current = activeIndex
  itemWidthRef.current = itemWidth

  // 首次拿到宽度后把薄片放到当前格
  useEffect(() => {
    if (itemWidth <= 0) return
    posX.setValue(activeIndex * itemWidth)
  }, [itemWidth, posX, activeIndex])

  // 点击切页 / 吸附完成后，薄片 spring 到目标格
  useEffect(() => {
    if (itemWidth <= 0) return
    Animated.spring(posX, {
      toValue: activeIndex * itemWidth,
      useNativeDriver: false,
      damping: 18,
      stiffness: 180,
      mass: 0.7,
    }).start()
  }, [activeIndex, itemWidth, posX])

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [enter])

  useEffect(() => {
    Animated.timing(compact, {
      toValue: collapsed ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [collapsed, compact])

  const handlePress = useCallback((id: NAV_ID_Type) => {
    setBarCollapsed(false)
    if (id === activeId) return
    setNavActiveId(id)
  }, [activeId])

  const snapTo = useCallback((index: number) => {
    const w = itemWidthRef.current
    Animated.spring(posX, {
      toValue: index * w,
      useNativeDriver: false,
      damping: 18,
      stiffness: 200,
      mass: 0.7,
    }).start()
    if (index !== activeIndexRef.current) {
      setBarCollapsed(false)
      setNavActiveId(NAV_MENUS[index].id)
    }
  }, [posX])

  // 按住薄片（在栏上任意位置按住再横滑）就把它拎起来拖着走
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > DRAG_START && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
    onPanResponderGrant: () => {
      hoverRef.current = activeIndexRef.current
      setDragIndex(activeIndexRef.current)
      Animated.timing(lift, { toValue: 1, duration: 140, useNativeDriver: false }).start()
    },
    onPanResponderMove: (_e, g) => {
      const w = itemWidthRef.current
      if (w <= 0) return
      const maxX = w * (NAV_MENUS.length - 1)
      const x = Math.min(maxX, Math.max(0, activeIndexRef.current * w + g.dx))
      posX.setValue(x)
      const index = Math.min(NAV_MENUS.length - 1, Math.max(0, Math.round(x / w)))
      if (index !== hoverRef.current) {
        hoverRef.current = index
        setDragIndex(index)
      }
    },
    onPanResponderRelease: () => {
      const index = hoverRef.current ?? activeIndexRef.current
      hoverRef.current = null
      setDragIndex(null)
      Animated.timing(lift, { toValue: 0, duration: 160, useNativeDriver: false }).start()
      snapTo(index)
    },
    onPanResponderTerminate: () => {
      const index = hoverRef.current ?? activeIndexRef.current
      hoverRef.current = null
      setDragIndex(null)
      Animated.timing(lift, { toValue: 0, duration: 160, useNativeDriver: false }).start()
      snapTo(index)
    },
  })).current

  const inactiveColor = isDark ? 'rgba(255,255,255,0.74)' : 'rgba(17,17,17,0.66)'
  const activeColor = isDark ? '#fff' : theme['c-primary']

  const chipWidth = itemWidth > 0 ? Math.min(itemWidth - Spacing.xs * 2, 68) : 0
  const chipScale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] })

  const miniWidth = compact.interpolate({ inputRange: [0, 1], outputRange: [0, MINI_SLOT - Spacing.xs] })
  const paddingBottom = compact.interpolate({ inputRange: [0, 1], outputRange: [Spacing.md + 2, Spacing.sm] })

  const chipBg = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.58)'
  const chipBorder = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.95)'
  const chipSheen = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)'

  return (
    <Animated.View
      style={[styles.wrap, {
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }]}
      pointerEvents="box-none"
    >
      {/* 注意：paddingBottom 是布局属性，只能 JS 驱动；
          transform / opacity 已经用 native driver，两者不能挂在同一个 Animated 节点上 */}
      <Animated.View style={{ paddingBottom }} pointerEvents="box-none">
        <View style={styles.barWrap}>
          <LiquidGlass radius={Radius.xxl} strength={1} edge={20} isDark={isDark} scrim={isDark ? 0.34 : 0.46} style={styles.bar}>
            <View style={styles.inner}>
              {/* 小圆放在玻璃内部左侧，跟着同一块玻璃一起裁切 */}
              <Animated.View style={{ width: miniWidth, height: '100%', justifyContent: 'center', overflow: 'hidden' }}>
                <View style={styles.miniSlot} pointerEvents="box-none">
                  <MiniPlayer visible={collapsed} onPress={onExpand ?? (() => {})} />
                </View>
              </Animated.View>
              {collapsed
                ? <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(17,17,17,0.08)' }]} />
                : null}
              <View
                style={styles.row}
                onLayout={e => { setRowWidth(e.nativeEvent.layout.width) }}
                {...pan.panHandlers}
              >
                {itemWidth > 0
                  ? (
                    <Animated.View style={{
                      position: 'absolute',
                      top: (BAR_HEIGHT - INDICATOR_H) / 2 - 6,
                      left: (itemWidth - chipWidth) / 2,
                      width: chipWidth,
                      height: INDICATOR_H,
                      borderRadius: INDICATOR_H / 2,
                      borderWidth: 1,
                      borderColor: chipBorder,
                      backgroundColor: chipBg,
                      overflow: 'hidden',
                      transform: [{ translateX: posX }, { scale: chipScale }],
                    }}>
                      {/* 上沿高光：玻璃薄片的"厚度" */}
                      <View style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: '52%',
                        backgroundColor: chipSheen,
                      }} />
                    </Animated.View>
                    )
                  : null}
                {NAV_MENUS.map((menu, index) => {
                  const active = index === displayIndex
                  return (
                    <TouchableOpacity
                      key={menu.id}
                      activeOpacity={0.55}
                      style={styles.item}
                      onPressIn={() => { setPressedIndex(index) }}
                      onPressOut={() => { setPressedIndex(null) }}
                      onPress={() => { handlePress(menu.id) }}
                    >
                      <TabContent
                        icon={menu.icon}
                        label={t(menu.id)}
                        active={active}
                        pressed={pressedIndex === index}
                        activeColor={activeColor}
                        inactiveColor={inactiveColor}
                      />
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          </LiquidGlass>
        </View>
      </Animated.View>
    </Animated.View>
  )
})

// 单个标签：选中(或拖动经过)时图标放大一点点 + 文字加重，比单纯变色更有"被按到"的实感
const TabContent = memo(({ icon, label, active, pressed, activeColor, inactiveColor }: {
  icon: any
  label: string
  active: boolean
  pressed: boolean
  activeColor: string
  inactiveColor: string
}) => {
  const scale = useRef(new Animated.Value(active ? 1 : 0)).current
  const press = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 260,
      mass: 0.6,
    }).start()
  }, [active, scale])

  // 按下时轻微回缩，松手弹回 —— 触感上"按到了实体按钮"
  useEffect(() => {
    Animated.spring(press, {
      toValue: pressed ? 1 : 0,
      useNativeDriver: true,
      damping: 14,
      stiffness: 320,
      mass: 0.5,
    }).start()
  }, [pressed, press])

  const iconScale = scale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] })
  const pressScale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] })
  const color = active ? activeColor : inactiveColor

  return (
    <Animated.View style={{ alignItems: 'center', transform: [{ scale: Animated.multiply(iconScale, pressScale) }] }}>
      <Icon name={icon} size={ICON_SIZE} color={color} />
      <Text
        size={10}
        color={color}
        style={{ fontWeight: active ? '700' : '400', marginTop: 3 }}
      >{label}</Text>
    </Animated.View>
  )
})

const styles = createStyle({
  wrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    backgroundColor: 'transparent',
  },
  barWrap: {
    height: BAR_HEIGHT,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  miniSlot: {
    width: MINI_SIZE,
    height: MINI_SIZE,
    marginLeft: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    marginLeft: Spacing.xs,
    borderRadius: 1,
  },
  bar: {
    height: BAR_HEIGHT,
    justifyContent: 'center',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: Spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
})
