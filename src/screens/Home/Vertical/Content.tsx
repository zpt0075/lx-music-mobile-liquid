import { View } from 'react-native'
import Header from './Header'
import Main from './Main'

/**
 * 首页内容区：玻璃标题栏 + PagerView。
 *
 * 标题栏是文档流内的整幅玻璃带；它下面就是各页自己的内容（页面背景 = 主题底色），
 * 所以玻璃采样到的就是"背景本身的颜色"，看上去和背景是同一块材质，不会出现色差。
 */
const Content = () => {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <Main />
    </View>
  )
}

export default Content
