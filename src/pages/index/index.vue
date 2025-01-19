<template>
  <view>
    <up-navbar title="研友坛" :autoBack="true" placeholder></up-navbar>
    <up-button
      type="primary"
      text="跳转"
      @click="
        router.push({
          name: 'my',
        })
      "
    ></up-button>
  </view>
</template>

<script setup lang="ts">
import router from '@/router'
</script>

<style></style>
