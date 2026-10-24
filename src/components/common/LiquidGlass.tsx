import { memo, useMemo } from 'react'
import { Platform, View, requireNativeComponent, type StyleProp, type ViewStyle, type HostComponent } from 'react-native'
import Gradient from './Gradient'
import { getSalt, makeShadows } from '@/theme/design'

/**
 * Liquid Glass 表面
 *
 * Android 上走原生实现：QWEA0/Liquid-Glass-Android 的 LiquidGlassView
 * （SDF 折射 + 背景模糊 + 色散 + 边缘高光，采样它背后真正绘制的内容）。
 * 其他平台 / 原生模块缺失时，回落到纯 JS 的分层近似。
 */

export interface LiquidGlassProps {
  radius?: number
  /** 0~1，整体不透明度（仅 JS 回退时起作用） */
  strength?: number
  /** 边缘折射带的宽度（JS 回退时起作用） */
  edge?: number
  isDark?: boolean
  style?: StyleProp<ViewStyle>
  /** 是否画外投影 */
  shadow?: boolean
  /** 玻璃自身染色（ARGB），默认由主题决定 */
  tint?: string
  /** 垫底遮罩不透明度 0~1，越大越“奶”、文字越清晰 */
  scrim?: number
  children?: React.ReactNode
}

interface NativeLiquidGlassProps {
  cornerRadius?: number
  tint?: number
  tintStrength?: number
  blurAmount?: number
  saturation?: number
  bevelWidth?: number
  refractionHeight?: number
  dispersion?: number
  material?: string
  dynamic?: boolean
  shaderPipeline?: boolean
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

let NativeLiquidGlass: HostComponent<NativeLiquidGlassProps> | null = null
if (Platform.OS === 'android') {
  try {
    NativeLiquidGlass = requireNativeComponent<NativeLiquidGlassProps>('RCTLiquidGlass')
  } catch (err) {
    NativeLiquidGlass = null
  }
}

// 主题色 → ARGB int（原生侧 setGlassTint 需要）；alpha 即染色强度
const toArgb = (isDark: boolean) => (isDark ? 0x26FFFFFF : 0x1AFFFFFF)

export default memo(({
  radius = 26,
  strength = 1,
  edge = 16,
  isDark = false,
  style,
  shadow = true,
  tint,
  scrim,
  children,
}: LiquidGlassProps) => {
  const salt = getSalt(isDark)
  const shadows = makeShadows(isDark)
  const a = (v: number) => Math.min(1, v * strength)

  const sheenColors = useMemo(() => [
    `rgba(255, 255, 255, ${a(isDark ? 0.16 : 0.92)})`,
    'rgba(255, 255, 255, 0)',
  ], [strength, isDark])

  const bottomColors = useMemo(() => [
    'rgba(255, 255, 255, 0)',
    `rgba(255, 255, 255, ${a(isDark ? 0.10 : 0.55)})`,
  ], [strength, isDark])

  const leftRefraction = useMemo(() => [
    `rgba(47, 107, 246, ${a(isDark ? 0.12 : 0.075)})`,
    'rgba(47, 107, 246, 0)',
  ], [strength, isDark])

  const rightRefraction = useMemo(() => [
    'rgba(47, 107, 246, 0)',
    `rgba(47, 107, 246, ${a(isDark ? 0.12 : 0.075)})`,
  ], [strength, isDark])

  if (NativeLiquidGlass) {
    const Native = NativeLiquidGlass
    return (
      <View style={[style, { overflow: 'hidden' }]}>
        {/* 玻璃只做背景层：原生视图采样背后内容做折射/模糊，RN 子节点叠在上层保证可交互 */}
        <Native
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: radius }}
          cornerRadius={radius}
          tint={toArgb(isDark)}
          blurAmount={0.42}
          saturation={180}
          bevelWidth={Math.max(14, radius * 0.8)}
          refractionHeight={Math.max(30, radius * 1.4)}
          dispersion={0.14}
          material="clear"
          dynamic
          shaderPipeline
        />
        {/* 低版本设备（<API33）拿不到 AGSL 模糊，补一层很淡的底，保证文字可读 */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: radius,
            backgroundColor: isDark
              ? `rgba(0,0,0,${scrim ?? 0.28})`
              : `rgba(255,255,255,${scrim ?? 0.3})`,
          }}
        />
        {children}
      </View>
    )
  }

  return (
    <View
      style={[{
        borderRadius: radius,
        backgroundColor: salt.glass,
        borderWidth: 1,
        borderColor: salt.glassBorder,
      }, shadow && { ...shadows.float }, style]}
    >
      <View pointerEvents="none" style={{ ...absoluteFill, borderRadius: radius - 1, overflow: 'hidden' }}>
        <Gradient
          colors={sheenColors}
          direction="vertical"
          steps={22}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '58%', borderRadius: radius }}
        />
        <Gradient
          colors={bottomColors}
          direction="vertical"
          steps={18}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%', borderRadius: radius }}
        />
        <Gradient
          colors={leftRefraction}
          steps={12}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: edge }}
        />
        <Gradient
          colors={rightRefraction}
          steps={12}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: edge }}
        />
      </View>
      {children}
    </View>
  )
})

const absoluteFill = { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 }
