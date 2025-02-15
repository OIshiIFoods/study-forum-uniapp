<template>
  <view class="h-100vh grid grid-rows-[1fr_auto]">
    <view
      class="box-border p-[0_calc(var(--page-side-unit-size)*5)] overflow-auto"
    >
      <up-navbar :title="curDirInfo.title" auto-back placeholder />

      <SearchColumn v-model:cur-dir-info="curDirInfo" />
      <ToolBar v-model:cur-dir-info="curDirInfo" />
      <FileArea v-model:cur-dir-info="curDirInfo" />
    </view>
    <view>
      <FileOperationPopup v-model:cur-dir-info="curDirInfo" />
      <FloadButton v-model:cur-dir-info="curDirInfo" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FileStatusEnum } from '@/service/types/db'
import { getUserFiles } from '@/service'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import SearchColumn from './components/SearchColumn.vue'
import ToolBar from './components/ToolBar.vue'
import FileArea from './components/FileArea.vue'
import FileOperationPopup from './components/FileOperationPopup.vue'
import FloadButton from './components/FloadButton.vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const curDirInfo = ref<CurDirInfoType>({
  title: '文件管理',
  path: '/',
  fileStatus: 1,
  fileList: [],
  selectedFiles: [],
  viewMode: 'list',
})

onLoad((option: any) => {
  // 更新当前访问目录信息
  if (option.dirPath) {
    curDirInfo.value.path = option.dirPath
  } else {
    curDirInfo.value.path = '/'
  }
  // 更新页面标题
  curDirInfo.value.title = option.dirPath?.split('/').pop() || '文件管理'
})

onShareAppMessage(({ from, target }) => {
  if (from === 'button') {
    return {
      title: '文件分享',
      path: `/pages/fileShare/index?${Object.entries({
        sharedUserId: userStore.id,
        sharedFileIds: curDirInfo.value.selectedFiles.map((item) => item.id),
      })
        .map(([field, value]) => field + '=' + value)
        .join('&')}`,
      success(...arg) {
        console.log('arg', arg)
        uni.showToast({
          title: '分享成功',
          icon: 'none',
        })
      },
      fail(...arg) {
        console.log('arg', arg)
        uni.showToast({
          title: '分享失败',
          icon: 'none',
        })
      },
    }
  } else {
    return {}
  }
})

export type CurDirInfoType = {
  title: string
  path: string
  fileStatus: FileStatusEnum
  fileList: Awaited<ReturnType<typeof getUserFiles>>['data']['fileInfoList']
  selectedFiles: Awaited<
    ReturnType<typeof getUserFiles>
  >['data']['fileInfoList']
  viewMode: 'grid' | 'list'
}
</script>
