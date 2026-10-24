/**
 * 首次启动自动导入并启用用户自定义源脚本。
 *
 * 背景：LX Music 的自定义源脚本在移动端只能通过「设置 → 自定义源 → 导入」手动选文件，
 * 这里做一个可选的自举：脚本内容放在 `./emSourceScript.ts`（仓库里是空占位），
 * 有内容时在 userApi 初始化后导入，并确保它被选为当前音源。
 *
 * 想移除自动导入行为：删掉本文件，并去掉 `core/init/index.ts` 里对 seedEmSource 的调用。
 * 已导入过的源保存在 AsyncStorage 里，不受影响。
 */
import { importUserApi, setUserApiAllowShowUpdateAlert } from '@/core/userApi'
import { setApiSource } from '@/core/apiSource'
import { updateSetting } from '@/core/common'
import settingState from '@/store/setting/state'
import { getUserApiList } from '@/utils/data'
import { toast } from '@/utils/tools'
import script from './emSourceScript'

const SOURCE_NAME_KEY = 'EM音源'

export const seedEmSource = async() => {
  // 占位文件里脚本为空 —— 直接跳过，把音源选择权交回给用户
  if (!script) return
  try {
    const list = await getUserApiList()
    const exist = list.find(api => String(api.name ?? '').includes(SOURCE_NAME_KEY))
    let apiId = exist?.id
    if (!apiId) {
      const info: any = await importUserApi(script)
      apiId = info?.id
      if (!apiId) {
        const next = await getUserApiList()
        apiId = next.find(api => String(api.name ?? '').includes(SOURCE_NAME_KEY))?.id
      }
      if (!apiId) throw new Error('import failed')
      // 该脚本自带联网检查更新，首次导入时不要弹更新提示打断启动
      await setUserApiAllowShowUpdateAlert(apiId, false)
      console.log('[seed] 自定义源导入成功', apiId)
      toast(`已导入音源：${SOURCE_NAME_KEY}`)
    }
    if (settingState.setting['common.apiSource'] !== apiId) {
      updateSetting({ 'common.apiSource': apiId })
      setApiSource(apiId)
      console.log('[seed] 已切换音源到', apiId)
    }
  } catch (err: any) {
    console.warn('[seed] 自定义源处理失败', err?.message ?? err)
  }
}
