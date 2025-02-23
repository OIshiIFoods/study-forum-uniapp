<template>
  <view class="h-100vh bg-#f1f2f4 overflow-auto">
    <up-navbar title="账号资料" placeholder auto-back />
    <up-cell-group class="mt-20px bg-#fff">
      <up-cell is-link title="头像">
        <template #value>
          <up-avatar
            :src="baseURL + '' + userStore.avatarLink"
            shape="square"
          />
        </template>
      </up-cell>
      <up-cell is-link title="昵称" :value="userStore.nickname" />
      <up-cell is-link title="性别" :value="sexMap[userStore.sex ?? 0]" />
      <up-cell is-link title="出生年月" :value="'生日当天会收到祝福'" />
      <up-cell is-link title="个性签名" :value="userStore.signature" />
    </up-cell-group>
  </view>
  <up-popup :show="popupConfig.show" mode="right">
    <up-navbar
      title="账号资料"
      placeholder
      @left-click="popupConfig.show = false"
    />
  </up-popup>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import { sexMap } from '@/config/constant'
import { useUserStore } from '@/stores'
import type { _FormRef } from 'uview-plus/types/comps/form'
import { reactive, ref } from 'vue'

const userStore = useUserStore()

const modifyInfoFormRef = ref<_FormRef>()
const popupConfig = reactive({
  show: false,
})
</script>
