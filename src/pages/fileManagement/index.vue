<template>
  <view class="h-100vh grid grid-rows-[1fr_auto]">
    <view
      class="box-border p-[0_calc(var(--page-side-unit-size)*5)] overflow-auto"
    >
      <up-navbar :title="curDirInfo.title" auto-back placeholder />

      <SearchColumn />
      <ToolBar v-model:cur-dir-info="curDirInfo" :getFileList="getFileList" />
      <FileArea v-model:cur-dir-info="curDirInfo" :getFileList="getFileList" />
    </view>
    <view>
      <FileOperationPopup
        v-model:cur-dir-info="curDirInfo"
        :getFileList="getFileList"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import mime from 'mime-types'
import type { FileStatusEnum } from '@/service/types/db'
import type { GetFileList } from '@/service/types/api'
import { getUserFiles } from '@/service'
import { onLoad } from '@dcloudio/uni-app'
import SearchColumn from './components/SearchColumn.vue'
import ToolBar from './components/ToolBar.vue'
import FileArea from './components/FileArea.vue'
import FileOperationPopup from './components/FileOperationPopup.vue'

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
  if (option.curDirParentPath) {
    curDirInfo.value.path =
      (option.curDirParentPath === '/' ? '' : option.curDirParentPath) +
      '/' +
      option.curDirName
  } else {
    curDirInfo.value.path = '/'
  }
  // 更新页面标题
  curDirInfo.value.title = option.curDirName ?? '文件管理'
})
const getFileList = async (
  params: GetFileListProps
): Promise<CurDirInfoType['fileList']> => {
  const { data } = await getUserFiles({
    parentPath: params.dirPath,
    status: params.fileStatus,
    orderBy: params.orderBy ? JSON.stringify(params.orderBy) : undefined,
  })
  return data?.fileInfoList && Array.isArray(data?.fileInfoList)
    ? data.fileInfoList.map((item) => ({
        fullname:
          item.name + (item.type ? '.' + mime.extension(item.type) : ''),
        ...item,
      }))
    : []
}

export type OrderByOptions = {
  /** 字段名称 */
  field: string
  /** 排序方向 */
  direction: 'ASC' | 'DESC'
}

export type CurDirInfoType = {
  title: string
  path: string
  fileStatus: FileStatusEnum
  fileList: (GetFileList.Response['data']['fileInfoList'][0] & {
    fullname: string
  })[]
  selectedFiles: (GetFileList.Response['data']['fileInfoList'][0] & {
    fullname: string
  })[]
  viewMode: 'grid' | 'list'
}

export type GetFileListProps = {
  dirPath: string
  fileStatus: FileStatusEnum
  orderBy?: OrderByOptions[]
}
</script>
