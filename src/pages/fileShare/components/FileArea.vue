<template>
  <up-list v-if="curDirInfo.viewMode === 'grid'" height="auto">
    <up-list-item
      class="overflow-hidden"
      v-for="item in curDirInfo.sharedFiles"
      :key="item.id"
    >
      <up-cell
        :title="item.fullname"
        :titleStyle="{ color: '#000', fontSize: '14px' }"
        :label="dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss')"
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
  <view v-else class="flex flex-wrap">
    <view
      class="pos-relative flex flex-col items-center justify-center w-[25%] box-border p-[10px] overflow-hidden"
      v-for="item in curDirInfo.sharedFiles"
      :key="item.id"
      @click="handleFileClick(item)"
      @longpress="handleFileLongPress(item)"
    >
      <view
        class="w-[70%] p-t-[100%] bg-center bg-contain bg-no-repeat"
        :style="{
          backgroundImage: `url(${baseURL + '/api/v1/public/images/fileIcons'}/${getFileIconName(item.fullname, !!item.isDir)})`,
        }"
      />
      <text class="text-[12px]">{{ item.fullname }}</text>
      <view
        class="pos-absolute pos-top-3px pos-right-3px"
        @click.stop="() => {}"
      >
        <view
          v-if="
            !curDirInfo.selectedFiles.find(
              (slectFile) => slectFile.id === item.id
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
              (slectFile) => slectFile.id !== item.id
            )
          "
        />
      </view>
      <view
        class="pos-absolute pos-right-15% pos-bottom-30% text-[20px] iconfont"
        :class="[item.accessPermissions ? '' : 'icon-locked']"
      />
    </view>
  </view>
  <up-icon
    class="pos-fixed pos-right-[-100px] pos-bottom-20% transition-all"
    :class="
      curDirInfo.selectedFiles.length === 1 &&
      !curDirInfo.selectedFiles[0].isDir &&
      'pos-right-10px'
    "
    @click="
      () => {
        reportModal && (reportModal.reportPopup.show = true)
      }
    "
    name="warning"
    color="#cc9554"
    :size="35"
  />
  <ReportModal
    ref="reportModal"
    :target-id="curDirInfo.selectedFiles[0]?.originFileId ?? -1"
    :target-type="ReportTargetType.File"
    @success="() => {}"
  />
</template>

<script setup lang="ts">
import type { CurDirInfoType, OnLoadOptionsType } from '../index.vue'
import dayjs from 'dayjs'
import router from '@/router'
import { baseURL } from '@/api/http'
import { onBeforeMount, onMounted, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getFileIconConfig, getUserFiles } from '@/service'
import mime from 'mime'
import ReportModal, { type ReportRefType } from '@/components/ReportModal.vue'
import { ReportTargetType } from '@/service/types/db.d'

const curDirInfo = defineModel<CurDirInfoType>('curDirInfo', {
  required: true,
})
const fileIconConfig = ref<any>({})
const isFirstPage = getCurrentPages().length === 1

onLoad(async (option: any) => {
  const options = option as OnLoadOptionsType
  // 获取文件图标配置
  getFileIconConfig().then((res) => {
    fileIconConfig.value = res
  })
  const { data: shareFileData } = await getUserFiles({
    userId: options.sharedUserId ? +options.sharedUserId : undefined,
    fileIds: options.sharedFileIds
      ? options.sharedFileIds.split(',').map((id: string) => +id)
      : undefined,
    parentPath: options.parentPath ?? '/',
  })
  curDirInfo.value.sharedFiles = shareFileData.fileInfoList
})

const reportModal = ref<ReportRefType>()

const handleFileClick = (fileInfo: CurDirInfoType['sharedFiles'][0]) => {
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
  if (fileInfo.isDir) {
    router.push({
      name: 'fileShare',
      params: {
        sharedUserId: '' + curDirInfo.value.sharedUserInfo!.id,
        parentPath:
          fileInfo.parentPath === '/'
            ? '/' + fileInfo.name
            : fileInfo.parentPath + '/' + fileInfo.name,
      },
    })
  }
}

const handleFileLongPress = (fileInfo: CurDirInfoType['sharedFiles'][0]) => {
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
</script>
