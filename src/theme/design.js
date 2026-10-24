// Design tokens — Salt Light / Liquid Glass
//
// 设计取向（参考 Moriafly/SaltUI 的克制留白 + 单一主色）：
//   · 大面积近白底 + 纯白表面，靠 hairline 和极淡投影分层
//   · 单一蓝色主色，只在"选中/可点/进度"处出现
//   · 圆角 16~26，玻璃元素用白色高光 + 边缘折射，不堆渐变
//
// 所有组件从这里取值，避免魔法数字。

const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
}

const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
}

const FontSize = {
  micro: 10,
  tiny: 11,
  caption: 12,
  body: 14,
  bodyLg: 15,
  title: 17,
  titleLg: 20,
  headline: 24,
  display: 30,
  giant: 40,
}

const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}

const LineHeight = {
  tight: 1.2,
  normal: 1.4,
  loose: 1.6,
}

const Motion = {
  fast: 140,
  normal: 220,
  slow: 360,
  spring: { damping: 18, stiffness: 180, mass: 0.9 },
}

// Salt 色板：明亮极简
const Salt = {
  light: {
    bg: '#F5F6F8',
    bgSoft: '#FAFBFC',
    surface: '#FFFFFF',
    ink: '#14161A',
    ink2: '#5A616D',
    ink3: '#98A1AD',
    hairline: 'rgba(17, 20, 28, 0.07)',
    hairlineStrong: 'rgba(17, 20, 28, 0.12)',
    accent: '#2F6BF6',
    accentSoft: 'rgba(47, 107, 246, 0.10)',
    accentTint: '#EAF0FE',
    // 单色相微渐变：仅用于进度条 / 播放键，避免"多彩"
    stops: ['#2F6BF6', '#4F87FF'],
    // 氛围光：极淡的单色晕，克制不抢眼
    glowPrimary: 'rgba(47, 107, 246, 0.16)',
    glowSecondary: 'rgba(120, 160, 255, 0.12)',
    // 玻璃：白色半透明 + 高光 + 边缘
    glass: 'rgba(255, 255, 255, 0.56)',
    glassStrong: 'rgba(255, 255, 255, 0.74)',
    glassBorder: 'rgba(255, 255, 255, 0.92)',
    sheen: 'rgba(255, 255, 255, 0.96)',
    refraction: 'rgba(47, 107, 246, 0.06)',
    scrim: 'rgba(17, 20, 28, 0.28)',
  },
  dark: {
    bg: '#111215',
    bgSoft: '#16171B',
    surface: '#1A1B1F',
    ink: '#E8EAF0',
    ink2: '#9AA1AC',
    ink3: '#6B7280',
    hairline: 'rgba(255, 255, 255, 0.09)',
    hairlineStrong: 'rgba(255, 255, 255, 0.16)',
    accent: '#7A9EFF',
    accentSoft: 'rgba(122, 158, 255, 0.16)',
    accentTint: '#1E2536',
    stops: ['#7A9EFF', '#9DBAFF'],
    glowPrimary: 'rgba(122, 158, 255, 0.18)',
    glowSecondary: 'rgba(90, 120, 220, 0.14)',
    glass: 'rgba(255, 255, 255, 0.07)',
    glassStrong: 'rgba(255, 255, 255, 0.12)',
    glassBorder: 'rgba(255, 255, 255, 0.16)',
    sheen: 'rgba(255, 255, 255, 0.22)',
    refraction: 'rgba(122, 158, 255, 0.10)',
    scrim: 'rgba(0, 0, 0, 0.55)',
  },
}

const getSalt = isDark => isDark ? Salt.dark : Salt.light

// 兼容旧引用：Aurora 现在等于 Salt 的单色相版本（不再多彩）
const Aurora = Salt
const getAurora = getSalt

// 投影：亮色靠极淡的柔和投影分层，暗色靠深投影 + 描边
const makeShadows = isDark => isDark
  ? {
      card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
        elevation: 8,
      },
      float: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.45,
        shadowRadius: 22,
        elevation: 14,
      },
      glow: {
        shadowColor: '#7A9EFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 6,
      },
    }
  : {
      card: {
        shadowColor: '#1B2130',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      },
      float: {
        // 玻璃浮层：更散、更淡，避免"廉价厚投影"
        shadowColor: '#1B2130',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10,
        shadowRadius: 24,
        elevation: 8,
      },
      glow: {
        shadowColor: '#2F6BF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 4,
      },
    }

const makeSaltShadows = makeShadows

module.exports = {
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  LineHeight,
  Motion,
  Salt,
  getSalt,
  makeSaltShadows,
  Aurora,
  getAurora,
  makeShadows,
}
