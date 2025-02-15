<template>
  <up-navbar :title="curDirInfo.title" placeholder>
    <template #left>
      <view
        class="flex items-center justify-between b-0.5px b-solid b-#efeff1 rounded-100px p-[3px_7px] opacity-80"
      >
        <up-icon
          v-if="!isFirstPage"
          name="arrow-left"
          size="19"
          @click="router.back()"
        />
        <up-line
          v-if="!isFirstPage"
          direction="col"
          :hairline="false"
          length="16"
          margin="0 8px"
        />
        <up-icon
          name="home"
          size="20"
          @click="router.pushTab({ name: 'index' })"
        />
      </view>
    </template>
  </up-navbar>
</template>

<script setup lang="ts">
import router from '@/router'
import type { CurDirInfoType } from '../index.vue'

const isFirstPage = getCurrentPages().length === 1
const curDirInfo = defineModel<CurDirInfoType>('curDirInfo', {
  required: true,
})
</script>
