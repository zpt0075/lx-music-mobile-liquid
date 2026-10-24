import { memo, useMemo } from 'react'
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'

/**
 * 纯 JS 线性渐变（无原生依赖）
 * 通过 N 段色带堆叠模拟渐变，避免引入 react-native-linear-gradient 原生模块。
 */

type RGBA = [number, number, number, number]

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))

const parseColor = (color?: string): RGBA => {
  if (typeof color !== 'string') return [0, 0, 0, 0]
  const c = color.trim()
  if (c.startsWith('#')) {
    let hex = c.slice(1)
    if (hex.length === 3) hex = hex.split('').map(s => s + s).join('')
    const int = parseInt(hex.slice(0, 6), 16)
    const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255, a]
  }
  const m = /rgba?\(([^)]+)\)/.exec(c)
  if (m) {
    const parts = m[1].split(',').map(s => parseFloat(s))
    return [clamp(parts[0]), clamp(parts[1]), clamp(parts[2]), parts[3] == null ? 1 : parts[3]]
  }
  return [0, 0, 0, 1]
}

const toRgba = ([r, g, b, a]: RGBA) => `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`

const buildStops = (colors: string[], steps: number) => {
  const parsed = colors.map(parseColor)
  const segments = parsed.length - 1
  if (segments < 1) return [toRgba(parsed[0])]
  const out: string[] = []
  for (let i = 0; i < steps; i += 1) {
    const t = steps === 1 ? 0 : i / (steps - 1)
    const scaled = t * segments
    const idx = Math.min(segments - 1, Math.floor(scaled))
    const local = scaled - idx
    const from = parsed[idx]
    const to = parsed[idx + 1]
    out.push(toRgba([
      from[0] + (to[0] - from[0]) * local,
      from[1] + (to[1] - from[1]) * local,
      from[2] + (to[2] - from[2]) * local,
      from[3] + (to[3] - from[3]) * local,
    ]))
  }
  return out
}

export interface GradientProps {
  colors: string[]
  /** 渐变方向，默认水平 */
  direction?: 'horizontal' | 'vertical'
  /** 色带数量，越大越平滑 */
  steps?: number
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

export default memo(({ colors, direction = 'horizontal', steps = 30, style, children }: GradientProps) => {
  const bands = useMemo(() => buildStops(colors, steps), [colors, steps])
  const isVertical = direction === 'vertical'

  return (
    <View style={[{ overflow: 'hidden', backgroundColor: colors[0] }, style]}>
      <View style={[StyleSheet.absoluteFill, { flexDirection: isVertical ? 'column' : 'row' }]}>
        {bands.map((color, index) => (
          <View key={index} style={{ flex: 1, backgroundColor: color }} />
        ))}
      </View>
      {children}
    </View>
  )
})

/**
 * 柔光氛围层：用多层同心圆模拟径向渐变（RN 无 blur 时最接近"光晕"的做法）
 * 从外到内逐层提高透明度，边缘几乎不可见，中心略亮。
 */
export const Glow = memo(({ color, size, style, layers = 16 }: { color: string, size: number, style?: StyleProp<ViewStyle>, layers?: number }) => {
  const rings = useMemo(() => {
    const [r, g, b, a] = parseColor(color)
    const out: { size: number, color: string }[] = []
    for (let i = 0; i < layers; i += 1) {
      const t = i / (layers - 1)
      out.push({
        size: size * (1 - 0.78 * t),
        color: toRgba([r, g, b, a * (0.055 + 0.075 * t)]),
      })
    }
    return out
  }, [color, size, layers])

  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {rings.map((ring, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: ring.size,
            height: ring.size,
            borderRadius: ring.size / 2,
            backgroundColor: ring.color,
          }}
        />
      ))}
    </View>
  )
})
