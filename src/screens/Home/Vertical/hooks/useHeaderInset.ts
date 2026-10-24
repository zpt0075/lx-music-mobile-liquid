import { scaleSizeH } from '@/utils/pixelRatio'
import { HEADER_HEIGHT } from '@/config/constant'
import { useStatusbarHeight } from '@/store/common/hook'

/**
 * 顶部玻璃标题栏是悬浮的（内容从它下面滑过），列表需要留出等高的一段，
 * 否则第一条会被标题栏压住。返回值为 状态栏 + 标题栏 的总高度。
 */
export default function useHeaderInset() {
  const statusBarHeight = useStatusbarHeight()
  return scaleSizeH(HEADER_HEIGHT) + statusBarHeight
}
