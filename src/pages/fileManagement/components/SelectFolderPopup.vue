<template>
  <!-- 选择文件夹弹出窗 -->
  <up-popup :show="isShow">
    <view class="grid grid-rows-[auto_1fr_auto] h-80vh p-[0_10px_20px]">
      <view class="flex justify-between items-center box-border p-[20px_0px]">
        <view
          @click="
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
        >
          <view v-if="selectFolderPopupConfig.curDirPath.split('/').at(-1)">
            <up-icon name="arrow-left" />
            <view class="text-[15px] font-700 ml-[10px]">
              {{ selectFolderPopupConfig.curDirPath.split('/').at(-2) }}
            </view>
          </view>
        </view>
        <view class="text-[15px] font-700">
          {{ selectFolderPopupConfig.curDirPath.split('/').at(-1) }}
        </view>
        <view>
          <up-icon name="close" @click="isShow = false" />
        </view>
      </view>
      <view class="flex flex-col overflow-auto">
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
                  file.parentPath === '/'
                    ? '/' + file.name
                    : file.parentPath + '/' + file.name
                selectFolderPopupConfig.folderList = await getFolderList(
                  selectFolderPopupConfig.curDirPath
                )
              }
            "
          />
        </up-cell-group>
      </view>
      <view class="flex justify-between">
        <up-button
          :text="props.okText"
          type="primary"
          @click="
            () => {
              emit('onOk', selectFolderPopupConfig.curDirPath)
            }
          "
        />
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { CurDirInfoType } from '../index.vue'
import { getUserFiles } from '@/service'

const props = withDefaults(
  defineProps<{
    initialDirPath?: string
    okText?: string
  }>(),
  {
    initialDirPath: '/',
    okText: '确定',
  }
)
const isShow = defineModel<boolean>('isShow', {
  required: true,
})

const emit = defineEmits(['onOk'])

watch(
  [() => props.initialDirPath],
  async () => {
    selectFolderPopupConfig.folderList = await getFolderList(
      props.initialDirPath
    )
  },
  {
    immediate: true,
  }
)

/** 选择文件夹弹出框配置 */
const selectFolderPopupConfig = reactive({
  curDirPath: props.initialDirPath,
  folderList: [] as CurDirInfoType['fileList'],
})

/** 获取文件夹列表 */
async function getFolderList(dirPath: string) {
  return (
    await getUserFiles({
      parentPath: dirPath,
      status: 1,
    })
  ).data.fileInfoList.filter(({ isDir }) => isDir)
}
</script>
