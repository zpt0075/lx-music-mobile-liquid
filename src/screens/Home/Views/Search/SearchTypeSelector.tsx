import { useEffect, useMemo, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

import { createStyle } from '@/utils/tools'
import { type SearchType } from '@/store/search/state'
import { useI18n } from '@/lang'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
import { getSearchSetting } from '@/utils/data'
import { Radius } from '@/theme/design'

const SEARCH_TYPE_LIST = [
  'music',
  'songlist',
] as const

/**
 * 搜索类型分段控件（歌曲 / 歌单）
 *
 * 选中态直接用主题主色实心胶囊 + 白色文字，跟页面其它主色元素保持一套语言；
 * 未选中是半透明白底，落在玻璃头部里也不会糊成一片。
 */
export default () => {
  const t = useI18n()
  const theme = useTheme()
  const [type, setType] = useState<SearchType>('music')

  useEffect(() => {
    void getSearchSetting().then(info => {
      setType(info.type)
    })
  }, [])

  const list = useMemo(() => {
    return SEARCH_TYPE_LIST.map(type => ({ label: t(`search_type_${type}`), id: type }))
  }, [t])

  const handleTypeChange = (type: SearchType) => {
    setType(type)
    global.app_event.searchTypeChanged(type)
  }

  const activeBg = theme['c-primary']
  const trackBg = theme.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(17,17,17,0.05)'

  return (
    <View style={[styles.container, { backgroundColor: trackBg }]}>
      {
        list.map(item => {
          const active = type === item.id
          return (
            <TouchableOpacity
              style={[styles.button, active && { backgroundColor: activeBg }]}
              activeOpacity={0.85}
              onPress={() => { handleTypeChange(item.id) }}
              key={item.id}
            >
              <Text
                style={[styles.buttonText, { fontWeight: active ? '600' : '500' }]}
                size={15}
                color={active ? '#fff' : theme['c-font']}
              >{item.label}</Text>
            </TouchableOpacity>
          )
        })
      }
    </View>
  )
}

const styles = createStyle({
  container: {
    height: 40,
    flexGrow: 0,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.pill,
    padding: 4,
    overflow: 'hidden',
  },
  button: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.pill,
    paddingLeft: 20,
    paddingRight: 20,
  },
  buttonText: {
    textAlign: 'center',
    lineHeight: 20,
  },
})
