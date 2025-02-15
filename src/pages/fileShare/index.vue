<template>
  <view>
    <up-navbar
      :title="curDirInfo.title"
      placeholder
      left-icon="home"
      @left-click="router.pushTab({ name: 'index' })"
    />
    <up-cell-group>
      <up-cell
        :title="curDirInfo.sharedUserInfo?.nickname + '的分享'"
        :title-style="{
          fontSize: '14px',
          fontWeight: '600',
        }"
        :label="curDirInfo.sharedUserInfo?.signature"
      >
        <template #icon>
          <up-avatar
            :src="baseURL + '' + curDirInfo.sharedUserInfo?.avatarLink"
            :size="40"
          />
        </template>
      </up-cell>
    </up-cell-group>
    <view class="font-700 p-[10px_0]">
      总共{{ curDirInfo.sharedFiles?.length || 0 }}个文件
    </view>
    <FileArea v-model:cur-dir-info="curDirInfo" />
  </view>
</template>

<script setup lang="ts">
import router from '@/router'
import { getUserFiles, getUserInfo } from '@/service'
import type { GetFileList, GetUserInfo } from '@/service/types/api'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import FileArea from './components/FileArea.vue'
import { baseURL } from '@/api/http'

export type OnLoadOptionsType = {
  sharedUserId: string
  sharedFileIds: string
}

export type CurDirInfoType = {
  path: string
  title: string
  viewMode: 'list' | 'grid'
  sharedUserInfo?: GetUserInfo.Response['data']
  selectedFiles: Awaited<
    ReturnType<typeof getUserFiles>
  >['data']['fileInfoList']
  sharedFiles: Awaited<ReturnType<typeof getUserFiles>>['data']['fileInfoList']
}

onLoad(async (option) => {
  let options = option as OnLoadOptionsType
  const { data: shareUserData } = await getUserInfo({
    userId: +options.sharedUserId,
  })
  curDirInfo.value.sharedUserInfo = shareUserData
})

const curDirInfo = ref<CurDirInfoType>({
  path: '',
  title: '文件分享',
  viewMode: 'grid',
  sharedFiles: [],
  selectedFiles: [],
})
</script>
