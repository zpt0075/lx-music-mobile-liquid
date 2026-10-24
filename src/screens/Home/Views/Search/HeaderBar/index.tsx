import { useRef, forwardRef, useImperativeHandle } from 'react'
import { View } from 'react-native'

import SourceSelector, {
  type SourceSelectorType as _SourceSelectorType,
  type SourceSelectorProps as _SourceSelectorProps,
} from '@/components/SourceSelector'
import SearchInput, { type SearchInputType, type SearchInputProps } from './SearchInput'
import LiquidGlass from '@/components/common/LiquidGlass'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import { type Source as MusicSource } from '@/store/search/music/state'
import { type Source as SonglistSource } from '@/store/search/songlist/state'
import { Radius } from '@/theme/design'

type Sources = Readonly<Array<MusicSource | SonglistSource>>
type SourceSelectorProps = _SourceSelectorProps<Sources>
type SourceSelectorType = _SourceSelectorType<Sources>

export interface HeaderBarProps {
  onSourceChange: SourceSelectorProps['onSourceChange']
  onTipSearch: SearchInputProps['onChangeText']
  onSearch: SearchInputProps['onSubmit']
  onHideTipList: SearchInputProps['onBlur']
  onShowTipList: SearchInputProps['onTouchStart']
}

export interface HeaderBarType {
  setSourceList: SourceSelectorType['setSourceList']
  setText: SearchInputType['setText']
  blur: SearchInputType['blur']
}


export default forwardRef<HeaderBarType, HeaderBarProps>(({ onSourceChange, onTipSearch, onSearch, onHideTipList, onShowTipList }, ref) => {
  const sourceSelectorRef = useRef<SourceSelectorType>(null)
  const searchInputRef = useRef<SearchInputType>(null)
  const theme = useTheme()


  useImperativeHandle(ref, () => ({
    setSourceList(list, source) {
      sourceSelectorRef.current?.setSourceList(list, source)
    },
    setText(text) {
      searchInputRef.current?.setText(text)
    },
    blur() {
      searchInputRef.current?.blur()
    },
  }), [])


  return (
    <View style={styles.searchBar}>
      <View style={[styles.selectorPill, { backgroundColor: theme.isDark ? 'rgba(28,28,34,0.55)' : 'rgba(255,255,255,0.62)' }]}>
        <LiquidGlass
          radius={Radius.pill}
          isDark={theme.isDark}
          scrim={theme.isDark ? 0.3 : 0.34}
          style={styles.glass}
        />
        <SourceSelector ref={sourceSelectorRef} onSourceChange={onSourceChange} center fontSize={14} />
        <Icon name="chevron-right" size={10} color={theme['c-font-label']} style={styles.chevron} />
      </View>
      <View style={styles.gap} />
      <SearchInput
        ref={searchInputRef}
        onChangeText={onTipSearch}
        onSubmit={onSearch}
        onBlur={onHideTipList}
        onTouchStart={onShowTipList}
      />
    </View>
  )
})

const styles = createStyle({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 12,
    paddingTop: 2,
    paddingBottom: 10,
  },
  selectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: Radius.pill,
    paddingLeft: 2,
    paddingRight: 14,
    overflow: 'hidden',
  },
  glass: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  chevron: {
    marginLeft: 4,
    transform: [{ rotate: '90deg' }],
  },
  gap: {
    width: 8,
  },
})
