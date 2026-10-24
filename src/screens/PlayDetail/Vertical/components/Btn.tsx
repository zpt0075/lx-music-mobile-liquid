import { TouchableOpacity } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'
import { scaleSizeH } from '@/utils/pixelRatio'
import { HEADER_HEIGHT as _HEADER_HEIGHT } from '@/config/constant'
import { useTheme } from '@/store/theme/hook'
import { Radius, getAurora } from '@/theme/design'

export const HEADER_HEIGHT = scaleSizeH(_HEADER_HEIGHT)

export default ({ icon, color, onPress }: {
  icon: string
  color?: string
  onPress: () => void
}) => {
  const theme = useTheme()
  const aurora = getAurora(theme.isDark)

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={{
        ...styles.circle,
        backgroundColor: aurora.glass,
        borderColor: aurora.hairline,
      }}
    >
      <Icon name={icon} color={color ?? theme['c-font']} size={16} />
    </TouchableOpacity>
  )
}

const styles = createStyle({
  circle: {
    width: 34,
    height: 34,
    marginHorizontal: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
