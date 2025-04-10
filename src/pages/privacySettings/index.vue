<template>
  <view class="min-h-screen bg-[var(--bg-color-grey)]">
    <up-navbar title="隐私设置" placeholder auto-back />
    <up-cell-group title="关系">
      <up-cell
        class="bg-white"
        title="黑名单用户"
        :titleStyle="{ fontSize: '13px' }"
        is-link
        @click="
          () => {
            router.push({
              name: 'blackList',
            })
          }
        "
      />
    </up-cell-group>
    <up-cell-group title="互动">
      <up-cell
        class="bg-white"
        title="允许别人访问我的空间"
        :titleStyle="{ fontSize: '13px' }"
        @click="() => {}"
      >
        <template #value>
          <up-switch
            v-model="privateInfo.spaceOpenStatus"
            :activeValue="spaceOpenStatusMap.open"
            :inactiveValue="spaceOpenStatusMap.close"
            :size="16"
            @change="
              async () => {
                await putUserInfo({
                  spaceOpenStatus: privateInfo.spaceOpenStatus,
                })
              }
            "
          />
        </template>
      </up-cell>
    </up-cell-group>
  </view>
</template>

<script setup lang="ts">
import { spaceOpenStatusMap } from '@/config/constant'
import router from '@/router'
import { putUserInfo } from '@/service'
import { useUserStore } from '@/stores'
import { reactive } from 'vue'

const userStore = useUserStore()
const privateInfo = reactive({
  spaceOpenStatus: userStore.spaceOpenStatus,
})
</script>
