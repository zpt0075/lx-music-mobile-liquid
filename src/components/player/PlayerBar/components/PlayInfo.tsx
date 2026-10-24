import { memo, useCallback, useState } from 'react'
import { View } from 'react-native'

import Status from './Status'
import { useProgress } from '@/store/player/hook'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import { COMPONENT_IDS } from '@/config/constant'
import { usePageVisible } from '@/store/common/hook'

const FONT_SIZE = 12

const PlayTimeCurrent = ({ timeStr }: { timeStr: string }) => {
  const theme = useTheme()
  return <Text size={FONT_SIZE} color={theme['c-font-label']}>{timeStr}</Text>
}

const PlayTimeMax = memo(({ timeStr }: { timeStr: string }) => {
  const theme = useTheme()
  return <Text size={FONT_SIZE} color={theme['c-font-label']}>{timeStr}</Text>
})

export default ({ isHome }: { isHome: boolean }) => {
  const theme = useTheme()
  const [autoUpdate, setAutoUpdate] = useState(true)
  const { maxPlayTimeStr, nowPlayTimeStr } = useProgress(autoUpdate)

  usePageVisible([COMPONENT_IDS.home], useCallback((visible) => {
    if (isHome) setAutoUpdate(visible)
  }, [isHome]))

  return (
    <View style={styles.container}>
      <View style={styles.status}>
        <Status autoUpdate={autoUpdate} />
      </View>
      <View style={styles.time}>
        <PlayTimeCurrent timeStr={nowPlayTimeStr} />
        <Text size={FONT_SIZE} color={theme['c-font-label']}> / </Text>
        <PlayTimeMax timeStr={maxPlayTimeStr} />
      </View>
    </View>
  )
}


const styles = createStyle({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  status: {
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  time: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
})
