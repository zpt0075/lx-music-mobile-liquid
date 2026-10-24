import { useEffect, useRef } from 'react'
import { View } from 'react-native'

import MusicList, { type MusicListType } from './MusicList'
import PageContent from '@/components/PageContent'
import StatusBar from '@/components/common/StatusBar'
import { setComponentId } from '@/core/common'
import { COMPONENT_IDS } from '@/config/constant'
import { type ListInfoItem } from '@/store/songlist/state'
import PlayerBar from '@/components/player/PlayerBar'
import { ListInfoContext } from './state'


export default ({ componentId, info }: { componentId: string, info: ListInfoItem }) => {
  const musicListRef = useRef<MusicListType>(null)
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    setComponentId(COMPONENT_IDS.songlistDetail, componentId)

    isUnmountedRef.current = false

    musicListRef.current?.loadList(info.source, info.id)


    return () => {
      isUnmountedRef.current = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <PageContent>
      <StatusBar />
      <ListInfoContext.Provider value={info}>
        <MusicList ref={musicListRef} componentId={componentId} />
      </ListInfoContext.Provider>
      {/* 悬浮播放条：列表从它下面滑过，玻璃才采得到内容；列表底部预留了 96 的 padding */}
      <View style={styles.bar} pointerEvents='box-none'>
        <PlayerBar />
      </View>
    </PageContent>
  )
}

const styles = {
  bar: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
  },
}

// const styles = createStyle({
//   container: {
//     width: '100%',
//     flex: 1,
//     flexDirection: 'row',
//     borderTopWidth: BorderWidths.normal,
//   },
//   content: {
//     flex: 1,
//   },
// })
