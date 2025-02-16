<template>
  <view class="h-100vh grid grid-rows-[1fr_auto]">
    <view>
      <Navbar v-model:cur-dir-info="curDirInfo" />
      <up-cell-group>
        <up-cell
          class="bg-[#f5f6fa]"
          :title="curDirInfo.sharedUserInfo?.nickname + '的分享'"
          :title-style="{
            fontSize: '14px',
            fontWeight: '600',
          }"
          :label="curDirInfo.sharedUserInfo?.signature"
        >
          <template #icon>
            <up-avatar
              class="mr-[10px]"
              :src="baseURL + '' + curDirInfo.sharedUserInfo?.avatarLink"
              :size="40"
            />
          </template>
        </up-cell>
      </up-cell-group>
      <view class="p-[0_20px]">
        <view class="text-[15px] font-700 p-[10px_0]">
          总共{{ curDirInfo.sharedFiles?.length || 0 }}个文件
        </view>
        <view class="flex justify-end">
          <up-icon
            :name="curDirInfo.viewMode"
            :size="20"
            color="var(--text-color-grey)"
            @click="
              curDirInfo.viewMode =
                curDirInfo.viewMode === 'list' ? 'grid' : 'list'
            "
          />
        </view>
        <FileArea v-model:cur-dir-info="curDirInfo" />
      </view>
    </view>
    <view class="p-[0_20px]">
      <up-button
        type="primary"
        :disabled="!curDirInfo.selectedFiles.length"
        @click="selectDirPopupConfig.isShow = true"
      >
        保存
      </up-button>
    </view>
  </view>
  <SelectFolderPopup
    v-model:is-show="selectDirPopupConfig.isShow"
    :ok-text="selectDirPopupConfig.okText"
    @on-ok="selectDirPopupConfig.onOk"
  />
</template>

<script setup lang="ts">
import router from '@/router'
import { copyUserFile, getUserFiles, getUserInfo } from '@/service'
import type { GetFileList, GetUserInfo } from '@/service/types/api'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import FileArea from './components/FileArea.vue'
import { baseURL } from '@/api/http'
import Navbar from './components/Navbar.vue'
import SelectFolderPopup from './components/SelectFolderPopup.vue'

export type OnLoadOptionsType = {
  sharedUserId: string
  sharedFileIds?: string
  parentPath?: string
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

const selectDirPopupConfig = reactive({
  isShow: false,
  excludeDir: [] as number[],
  okText: '保存到此',
  onOk: async (dirname: string) => {
    uni.showLoading({
      title: '保存中',
    })
    const { data: targetDirFilesData } = await getUserFiles({
      parentPath: dirname,
      status: 1,
    })
    if (
      curDirInfo.value.selectedFiles.find((item) =>
        targetDirFilesData.fileInfoList.find(
          ({ fullname }) => item.fullname === fullname
        )
      )
    ) {
      uni.showToast({
        title: '目标目录下已存在同名文件',
        icon: 'none',
      })
      return
    }
    await copyUserFile({
      copiedFileIdList: curDirInfo.value.selectedFiles.map(({ id }) => id),
      savePath: dirname,
    })
    uni.hideLoading()
    uni.showToast({
      title: '保存成功',
      icon: 'none',
    })
    selectDirPopupConfig.isShow = false
  },
})
</script>
