import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { type InitState } from '@/store/hotSearch/state'
import Button from '@/components/common/Button'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { clearHistoryList, getSearchHistory, removeHistoryWord } from '@/core/search/search'
import { Icon } from '@/components/common/Icon'
import { Radius, getAurora } from '@/theme/design'


export type List = NonNullable<InitState['sourceList'][keyof InitState['sourceList']]>

const ListItem = ({ keyword, onSearch, onRemove }: {
  keyword: string
  onSearch: (keyword: string) => void
  onRemove: (keyword: string) => void
}) => {
  const theme = useTheme()
  const aurora = getAurora(theme.isDark)
  return (
    <Button
      style={{ ...styles.button, backgroundColor: aurora.glass, borderColor: aurora.hairline }}
      onPress={() => { onSearch(keyword) }}
      onLongPress={() => { onRemove(keyword) }}
    >
      <Text color={theme['c-font']} size={12}>{keyword}</Text>
    </Button>
  )
}


interface HistorySearchProps {
  onSearch: (keyword: string) => void
}
export interface HistorySearchType {
  show: () => void
}

export default forwardRef<HistorySearchType, HistorySearchProps>((props, ref) => {
  const [list, setList] = useState<List>([])
  const isUnmountedRef = useRef(false)
  const t = useI18n()
  const theme = useTheme()

  useEffect(() => {
    isUnmountedRef.current = false
    return () => {
      isUnmountedRef.current = true
    }
  }, [])

  useImperativeHandle(ref, () => ({
    show() {
      void getSearchHistory().then((list) => {
        if (isUnmountedRef.current) return
        setList(list)
      })
    },
  }), [])

  const handleClear = () => {
    clearHistoryList()
    setList([])
  }

  const handleRemove = useCallback((keyword: string) => {
    setList(list => {
      list = [...list]
      const index = list.indexOf(keyword)
      list.splice(index, 1)
      removeHistoryWord(index)
      return list
    })
  }, [])

  return (
    list.length
      ? (
          <View>
            <View style={styles.titleContent}>
              <Text size={16}>{t('search_history_search')}</Text>
              <TouchableOpacity onPress={handleClear} style={styles.titleBtn}>
                <Icon name="eraser" color={theme['c-300']} size={14} />
              </TouchableOpacity>
            </View>
            <View style={styles.list}>
              {
                list.map(keyword => <ListItem keyword={keyword} key={keyword} onSearch={props.onSearch} onRemove={handleRemove} />)
              }
            </View>
          </View>
        )
      : null
  )
})


const styles = createStyle({
  titleContent: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    // paddingLeft: 15,
    // paddingBottom: 5,
  },
  titleBtn: {
    marginLeft: 10,
    padding: 5,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    textAlign: 'center',
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 7,
    paddingBottom: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginRight: 8,
    marginTop: 10,
  },
})
