import { useCallback, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { View } from 'react-native'
import Input, { type InputType, type InputProps } from '@/components/common/Input'
import { Icon } from '@/components/common/Icon'
import LiquidGlass from '@/components/common/LiquidGlass'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import { Radius } from '@/theme/design'

export interface SearchInputProps {
  onChangeText: (text: string) => void
  onSubmit: (text: string) => void
  onBlur: () => void
  onTouchStart: () => void
}

export interface SearchInputType {
  setText: (text: string) => void
  // getText: () => string
  focus: () => void
  blur: () => void
}

export default forwardRef<SearchInputType, SearchInputProps>(({ onChangeText, onSubmit, onBlur, onTouchStart }, ref) => {
  const theme = useTheme()
  const [text, setText] = useState('')
  const inputRef = useRef<InputType>(null)

  useImperativeHandle(ref, () => ({
    // getText() {
    //   return text.trim()
    // },
    setText(text) {
      setText(text)
    },
    focus() {
      inputRef.current?.focus()
    },
    blur() {
      inputRef.current?.blur()
    },
  }))

  const handleChangeText = (text: string) => {
    setText(text)
    onChangeText(text.trim())
  }

  const handleClearText = useCallback(() => {
    setText('')
    onChangeText('')
    onSubmit('')
  }, [onChangeText, onSubmit])

  const handleSubmit = useCallback<NonNullable<InputProps['onSubmitEditing']>>(({ nativeEvent: { text } }) => {
    onSubmit(text)
  }, [onSubmit])

  return (
    <View style={[styles.pill, { backgroundColor: theme.isDark ? 'rgba(28,28,34,0.55)' : 'rgba(255,255,255,0.62)' }]}>
      {/* 玻璃做背景层，内容叠在上面（原生视图不参与 RN 布局） */}
      <LiquidGlass
        radius={Radius.pill}
        isDark={theme.isDark}
        scrim={theme.isDark ? 0.3 : 0.34}
        style={styles.glass}
      />
      <Icon name="search-2" size={16} color={theme['c-font-label']} style={styles.icon} />
      <Input
        ref={inputRef}
        placeholder="Search for something..."
        value={text}
        size={14}
        style={styles.input}
        onChangeText={handleChangeText}
        onBlur={onBlur}
        onSubmitEditing={handleSubmit}
        onClearText={handleClearText}
        onTouchStart={onTouchStart}
        clearBtn
      />
    </View>
  )
})

const styles = createStyle({
  pill: {
    flexGrow: 1,
    flexShrink: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  glass: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  icon: {
    marginLeft: 15,
  },
  input: {
    height: 44,
    paddingLeft: 8,
    paddingRight: 0,
    fontSize: 14,
  },
})
