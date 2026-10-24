import { memo } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { useI18n } from '@/lang'
import { useNavActiveId, useStatusbarHeight } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import { confirmDialog, createStyle, exitApp as backHome } from '@/utils/tools'
import { NAV_MENUS } from '@/config/constant'
import type { InitState } from '@/store/common/state'
import { exitApp, setNavActiveId } from '@/core/common'
import Text from '@/components/common/Text'
import { useSettingValue } from '@/store/setting/hook'
import { FontWeight, Radius, getSalt } from '@/theme/design'

const styles = createStyle({
  container: {
    flex: 1,
    height: '100%',
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    marginLeft: 14,
  },
  menus: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 2,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  activeMark: {
    position: 'absolute',
    left: 4,
    top: 14,
    bottom: 14,
    width: 3,
    borderRadius: 3,
  },
  iconContent: {
    width: 26,
    alignItems: 'center',
  },
  text: {
    paddingLeft: 14,
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: 22,
    marginBottom: 8,
  },
})

const Header = () => {
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  const salt = getSalt(theme.isDark)

  return (
    <View style={{ paddingTop: statusBarHeight }}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={[styles.logoBox, { backgroundColor: salt.accentTint }]}>
            <Icon name="logo" color={theme['c-primary']} size={24} />
          </View>
          <View style={styles.brandText}>
            <Text size={19} color={theme['c-font']} style={{ fontWeight: FontWeight.semibold }}>LX Music</Text>
            <Text size={11} color={theme['c-font-label']} style={{ marginTop: 2, letterSpacing: 0.6 }}>盐白 · SALT LIGHT</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

type IdType = InitState['navActiveId'] | 'nav_exit' | 'back_home'

const MenuItem = ({ id, icon, onPress }: {
  id: IdType
  icon: string
  onPress: (id: IdType) => void
}) => {
  const t = useI18n()
  const activeId = useNavActiveId()
  const theme = useTheme()
  const salt = getSalt(theme.isDark)
  const isActive = activeId == id

  const inner = (
    <>
      {isActive ? <View style={[styles.activeMark, { backgroundColor: theme['c-primary'] }]} /> : null}
      <View style={styles.iconContent}>
        <Icon name={icon} size={19} color={isActive ? theme['c-primary'] : theme['c-font-label']} />
      </View>
      <Text
        style={styles.text}
        size={15}
        color={isActive ? theme['c-primary'] : theme['c-font']}
      >{t(id)}</Text>
    </>
  )

  return isActive
    ? <View style={[styles.menuItem, { backgroundColor: salt.accentSoft }]}>{inner}</View>
    : <TouchableOpacity
        style={styles.menuItem}
        activeOpacity={0.7}
        onPress={() => { onPress(id) }}
      >{inner}</TouchableOpacity>
}

export default memo(() => {
  const theme = useTheme()
  const salt = getSalt(theme.isDark)
  const showBackBtn = useSettingValue('common.showBackBtn')
  const showExitBtn = useSettingValue('common.showExitBtn')

  const handlePress = (id: IdType) => {
    switch (id) {
      case 'nav_exit':
        void confirmDialog({
          message: global.i18n.t('exit_app_tip'),
          confirmButtonText: global.i18n.t('list_remove_tip_button'),
        }).then(isExit => {
          if (!isExit) return
          exitApp('Exit Btn')
        })
        return
      case 'back_home':
        backHome()
        return
    }

    global.app_event.changeMenuVisible(false)
    setNavActiveId(id)
  }


  return (
    <View style={{ ...styles.container, backgroundColor: theme['c-content-background'] }}>
      <Header />
      <ScrollView style={styles.menus} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {NAV_MENUS.map(menu => <MenuItem key={menu.id} id={menu.id} icon={menu.icon} onPress={handlePress} />)}
        </View>
      </ScrollView>

      <View style={[styles.divider, { backgroundColor: salt.hairline }]} />

      {
        showBackBtn ? <View style={styles.footer}><MenuItem id="back_home" icon="home" onPress={handlePress} /></View> : null
      }
      {
        showExitBtn ? <View style={styles.footer}><MenuItem id="nav_exit" icon="exit2" onPress={handlePress} /></View> : null
      }
    </View>
  )
})
