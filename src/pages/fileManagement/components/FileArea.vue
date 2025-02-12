<template>
  <up-list v-if="curDirInfo.viewMode === 'grid'">
    <up-list-item
      class="overflow-hidden"
      v-for="item in curDirInfo.fileList"
      :key="item.id"
    >
      <up-cell
        :title="item.name"
        :titleStyle="{ color: '#000', fontSize: '14px' }"
        :label="dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss')"
        :border="false"
        @click="handleFileClick(item)"
        @longpress="handleFileLongPress(item)"
      >
        <template #icon>
          <view
            class="w-[40px] p-t-[100%] m-r-10px bg-center bg-contain bg-no-repeat"
            :style="{
              backgroundImage: `url(${baseURL + '/api/v1/public/images/fileIcons'}/${getFileIconName(item.fullname, !!item.isDir)})`,
            }"
          />
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
      v-for="item in curDirInfo.fileList"
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
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CurDirInfoType, GetFileListProps } from '../index.vue'
import dayjs from 'dayjs'
import router from '@/router'
import { baseURL } from '@/api/http'
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getFileIconConfig } from '@/service'

const props = defineProps<{
  getFileList: (params: GetFileListProps) => Promise<CurDirInfoType['fileList']>
}>()
const curDirInfo = defineModel<CurDirInfoType>('curDirInfo', {
  required: true,
})
const fileIconConfig = ref<any>({})

onLoad(async (option: any) => {
  // 获取文件图标配置
  getFileIconConfig().then((res) => {
    fileIconConfig.value = res
  })
  curDirInfo.value.fileList = await props.getFileList({
    dirPath: curDirInfo.value.path,
    fileStatus: curDirInfo.value.fileStatus,
  })
})

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
  if (fileInfo.isDir) {
    router.push({
      name: 'fileManagement',
      params: {
        curDirParentPath: curDirInfo.value.path,
        curDirName: fileInfo.name,
      },
    })
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
        languageIds[filename.split('.').pop() ?? ''] ??
        file
    ].iconPath
  }
}
</script>
