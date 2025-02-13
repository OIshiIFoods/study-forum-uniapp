<template>
  <view class="flex justify-between m-[10px_0]">
    <view class="flex items-center gap-col-8px">
      <view
        class="iconfont icon-refresh"
        @click="
          async () => {
            const { data } = await getUserFiles({
              parentPath: curDirInfo.path,
              status: curDirInfo.fileStatus,
            })
            curDirInfo.fileList = data.fileInfoList
          }
        "
      />
    </view>
    <view class="flex items-center gap-col-8px">
      <view class="iconfont icon-filter" @click="sortPopupConfig.show = true" />
      <up-icon
        :name="curDirInfo.viewMode"
        :size="20"
        color="var(--text-color-grey)"
        @click="
          curDirInfo.viewMode = curDirInfo.viewMode === 'list' ? 'grid' : 'list'
        "
      />
    </view>
  </view>
  <!-- 排序弹出框 -->
  <up-popup
    :show="sortPopupConfig.show"
    mode="bottom"
    closeable
    @close="sortPopupConfig.show = false"
  >
    <view class="p-[30px_18px]">
      <view
        class="flex items-center p-[10px_0]"
        @click="
          async () => {
            const { data } = await getUserFiles({
              parentPath: curDirInfo.path,
              status: curDirInfo.fileStatus,
              orderBy: [
                {
                  field: 'updateTime',
                  direction: 'DESC',
                },
              ],
            })
            curDirInfo.fileList = data.fileInfoList
            sortPopupConfig.show = false
          }
        "
      >
        <view class="iconfont icon-time text-[20px] mr-[10px]" />
        <text class="text-[13px] font-700">时间排序</text>
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { CurDirInfoType } from '../index.vue'
import { getUserFiles } from '@/service'

const curDirInfo = defineModel<CurDirInfoType>('curDirInfo', {
  required: true,
})

// 排序弹出框配置
const sortPopupConfig = reactive({
  show: false,
})
</script>
