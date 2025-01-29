<template>
  <view class="min-h-screen bg-[var(--bg-color-grey)]">
    <up-navbar title="设置" placeholder auto-back />
    <up-cell-group class="bg-white">
      <up-cell
        v-if="userStore.id"
        title="退出登录"
        :titleStyle="{ fontSize: '13px', textAlign: 'center' }"
        @click="exit"
      />
    </up-cell-group>
  </view>
</template>

<script setup lang="ts">
import router from '@/router'
import { useUserStore } from '@/stores'
const userStore = useUserStore()
const exit = () => {
  uni.removeStorageSync('token')
  userStore.$reset()
  router.push({ name: 'login' })
}
</script>
