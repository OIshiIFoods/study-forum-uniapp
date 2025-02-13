<template>
  <!-- 选择文件夹弹出窗 -->
  <up-popup class="h-100vh" :show="isShow">
    <up-navbar
      :leftIcon="selectFolderPopupConfig.curDirPath.split('/').at(-1) && 'back'"
      left-text="{{ selectFolderPopupConfig.curDirPath.split('/').at(-2) }}"
      @click-left="
        async () => {
          // 更新当前目录的路径
          selectFolderPopupConfig.curDirPath =
            selectFolderPopupConfig.curDirPath
              .split('/')
              .slice(0, -1)
              .join('/') || '/'
          selectFolderPopupConfig.folderList = await getFolderList(
            selectFolderPopupConfig.curDirPath
          )
        }
      "
      title="{{ selectFolderPopupConfig.curDirPath.split('/').at(-1) }}"
      rightIcon="close"
      @click-right="selectFolderPopupConfig.isShow = false"
    />
    <view class="flex flex-col p-[10px]">
      <up-cell-group>
        <up-cell
          v-for="file in selectFolderPopupConfig.folderList"
          :key="file.id"
          left-icon="folder"
          :title="file.name"
          is-link
          @click="
            async () => {
              selectFolderPopupConfig.curDirPath =
                file.parentPath + '/' + file.name
              selectFolderPopupConfig.folderList = await getFolderList(
                selectFolderPopupConfig.curDirPath
              )
            }
          "
        />
      </up-cell-group>
    </view>
    <view class="flex justify-between p-[10px]">
      <up-button
        :text="props.okText"
        @click="
          () => {
            props.onOk(selectFolderPopupConfig.curDirPath)
          }
        "
      />
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { onBeforeMount, reactive } from 'vue'
import type { CurDirInfoType } from '../index.vue'
import { getUserFiles } from '@/service'

const props = withDefaults(
  defineProps<{
    isShow: boolean
    initialDirPath?: string
    okText?: string
    onOk?: (selectDirPath: string) => any
  }>(),
  {
    isShow: false,
    initialDirPath: '/',
    okText: '确定',
    onOk: () => {},
  }
)

onBeforeMount(async () => {
  selectFolderPopupConfig.folderList = await getFolderList(props.initialDirPath)
})

/** 选择文件夹弹出框配置 */
const selectFolderPopupConfig = reactive({
  isShow: props.isShow,
  curDirPath: props.initialDirPath,
  folderList: [] as CurDirInfoType['fileList'],
})

/** 获取文件夹列表 */
const getFolderList = async (dirPath: string) => {
  return (
    await getUserFiles({
      parentPath: dirPath,
      status: 1,
    })
  ).data.fileInfoList.filter(({ isDir }) => isDir)
}
</script>
