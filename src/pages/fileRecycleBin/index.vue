<template>
  <up-navbar :title="curDirInfo.title" auto-back placeholder />
  <view class="p-[0_15px]" v-if="curDirInfo.fileList.length">
    <view class="flex justify-between">
      <view
        class="iconfont icon-refresh"
        @click="
          async () => {
            const { data } = await getUserFiles({
              status: curDirInfo.fileStatus,
            })
            curDirInfo.fileList = data.fileInfoList
          }
        "
      />
      <view
        class="text-15px text-[var(--primary-color)]"
        @click="
          async () => {
            await deleteFile({
              fileIdList: curDirInfo.fileList.map((item) => item.id),
            })
            const { data } = await getUserFiles({
              status: curDirInfo.fileStatus,
            })
            curDirInfo.fileList = data.fileInfoList
          }
        "
      >
        清空
      </view>
    </view>
    <up-list height="auto">
      <up-list-item
        class="overflow-hidden"
        v-for="item in curDirInfo.fileList"
        :key="item.id"
      >
        <up-cell
          :title="item.fullname"
          :titleStyle="{ color: '#000', fontSize: '14px' }"
          :label="dayjs(item.deleteTime).format('YYYY-MM-DD HH:mm:ss')"
          :border="false"
          @click="handleFileClick(item)"
          @longpress="handleFileLongPress(item)"
        >
          <template #icon>
            <view class="pos-relative">
              <view
                class="w-[40px] p-t-[100%] m-r-10px bg-center bg-contain bg-no-repeat"
                :style="{
                  backgroundImage: `url(${baseURL + '/api/v1/public/images/fileIcons'}/${getFileIconName(item.fullname, !!item.isDir)})`,
                }"
              />
              <view
                class="pos-absolute pos-left-[-10%] pos-bottom-0 text-[20px] iconfont"
                :class="[item.accessPermissions ? '' : 'icon-locked']"
              />
            </view>
          </template>
          <template #right-icon>
            <view @click.stop="() => {}">
              <view
                v-if="
                  !curDirInfo.selectedFiles.find(
                    (selectFile) => selectFile.id === item.id
                  )
                "
                class="w-10px h-10px b-1px b-style-solid b-[#ccc] rounded-full"
                @click="curDirInfo.selectedFiles.push(item)"
              />
              <up-icon
                v-else
                name="checkmark-circle-fill"
                color="#59a3f4"
                size="20"
                @click="
                  curDirInfo.selectedFiles = curDirInfo.selectedFiles.filter(
                    (selectFile) => selectFile.id !== item.id
                  )
                "
              />
            </view>
          </template>
        </up-cell>
      </up-list-item>
    </up-list>
    <up-popup :show="!!curDirInfo.selectedFiles.length" :overlay="false">
      <view class="flex bg-[#228df2] p-[10px]">
        <view
          class="flex-1 flex flex-col justify-center items-center justify-end"
          v-for="item in fileOperationList"
          @click="item.clickAction"
        >
          <view
            class="iconfont text-[#fff] p-[5px_0]"
            :class="'icon-' + item.icon"
            :style="{ fontSize: item.iconSize }"
          />
          <view class="text-[#fff] text-[13px]">{{ item.title }}</view>
        </view>
      </view>
    </up-popup>
  </view>
  <view v-else class="flex flex-col justify-center items-center h-80vh">
    <view class="text-[50px] iconfont icon-no-file"></view>
    <view class="text-15px p-[10px_0]">回收站为空</view>
  </view>
</template>

<script setup lang="ts">
import { FileStatusEnum } from '@/service/types/db.d'
import {
  deleteFile,
  getFileIconConfig,
  getUserFiles,
  updateFileInfo,
} from '@/service'
import { reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { baseURL } from '@/api/http'
import mime from 'mime'
import { onLoad } from '@dcloudio/uni-app'

onLoad(async (option: any) => {
  // 获取文件图标配置
  getFileIconConfig().then((res) => {
    fileIconConfig.value = res
  })
  const { data } = await getUserFiles({
    status: curDirInfo.value.fileStatus,
  })
  curDirInfo.value.fileList = data.fileInfoList
})

const curDirInfo = ref<CurDirInfoType>({
  title: '回收站',
  fileStatus: FileStatusEnum.RecycleBin,
  fileList: [],
  selectedFiles: [],
})
const fileIconConfig = ref<any>({})

const fileOperationList = [
  {
    icon: 'refresh',
    iconSize: '15px',
    title: '还原',
    clickAction: async () => {
      await updateFileInfo(
        curDirInfo.value.selectedFiles.map(({ id }) => ({
          id,
          status: FileStatusEnum.Normal,
        }))
      )
      const { data } = await getUserFiles({
        status: curDirInfo.value.fileStatus,
      })
      curDirInfo.value.fileList = data.fileInfoList
      curDirInfo.value.selectedFiles = []
      uni.showToast({
        title: '还原成功',
        icon: 'none',
      })
    },
  },
  {
    icon: 'delete',
    iconSize: '19px',
    title: '永久删除',
    clickAction: async () => {
      await deleteFile({
        fileIdList: curDirInfo.value.selectedFiles.map(({ id }) => id),
      })
      const { data } = await getUserFiles({
        status: curDirInfo.value.fileStatus,
      })
      curDirInfo.value.fileList = data.fileInfoList
      curDirInfo.value.selectedFiles = []
      uni.showToast({
        title: '删除成功',
        icon: 'none',
      })
    },
  },
]

const handleFileClick = (fileInfo: CurDirInfoType['fileList'][0]) => {
  // 当处于多选状态时，点击文件选中或取消选中
  const { selectedFiles } = curDirInfo.value
  if (selectedFiles.length > 0) {
    if (selectedFiles.find((item) => item.id === fileInfo.id)) {
      curDirInfo.value.selectedFiles = selectedFiles.filter(
        (item) => item.id !== fileInfo.id
      )
    } else {
      curDirInfo.value.selectedFiles.push(fileInfo)
    }
    return
  }
}

const handleFileLongPress = (fileInfo: CurDirInfoType['fileList'][0]) => {
  curDirInfo.value.selectedFiles.push(fileInfo)
}

const getFileIconName = (filename: string, isDir: boolean = false) => {
  if (!Object.entries(fileIconConfig.value).length) {
    return 'default_file.svg'
  }
  const { iconDefinitions } = fileIconConfig.value as any
  if (isDir) {
    const { folder, folderNames, folderNamesExpanded } =
      fileIconConfig.value as any
    return iconDefinitions[
      folderNamesExpanded[filename] ?? folderNames[filename] ?? folder
    ].iconPath
  } else {
    const { file, fileNames, fileExtensions, languageIds } =
      fileIconConfig.value as any
    return iconDefinitions[
      fileNames[filename] ??
        fileExtensions[filename.split('.').pop() ?? ''] ??
        languageIds[mime.getType(filename)?.split('/').pop() ?? ''] ??
        file
    ].iconPath
  }
}

export type CurDirInfoType = {
  title: string
  fileStatus: FileStatusEnum
  fileList: Awaited<ReturnType<typeof getUserFiles>>['data']['fileInfoList']
  selectedFiles: Awaited<
    ReturnType<typeof getUserFiles>
  >['data']['fileInfoList']
}
</script>
