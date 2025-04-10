<template>
  <view class="min-h-screen bg-[var(--bg-color-grey)]">
    <up-navbar title="黑名单" placeholder auto-back />
    <up-cell-group class="bg-white">
      <up-cell
        v-for="item in blackList"
        :key="item.id"
        :title="item.nickname"
        @click="
          () => {
            selectUser = item
            operationPopupConfig.show = true
          }
        "
      >
        <template #icon>
          <up-avatar
            shape="square"
            :size="35"
            :src="baseURL + '' + item.avatarLink"
            customStyle="margin: -3px 5px -3px 0"
          />
        </template>
      </up-cell>
    </up-cell-group>
  </view>
  <up-popup
    :show="operationPopupConfig.show"
    :duration="operationPopupConfig.duration"
    :mode="'bottom'"
    :onClose="() => (operationPopupConfig.show = false)"
  >
    <view class="p-[15px_10px] bg-#f5f5f5">
      <view
        class="rounded-4px p-10px bg-#fff text-center"
        v-for="(item, index) in operationPopupConfig.operationList"
        :key="item.label"
        :style="{ color: item.color }"
        @click="item.clickAction"
      >
        {{ item.label }}
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import router from '@/router'
import { getBlacklist, unblockUser } from '@/service'
import type { GetBlacklist } from '@/service/types/api'
import { useUserStore } from '@/stores'
import { onMounted, reactive, ref } from 'vue'

onMounted(async () => {
  const { data } = await getBlacklist()
  blackList.value = data.blacklist
})
const userStore = useUserStore()
const blackList = ref<GetBlacklist.Response['data']['blacklist']>([])
const selectUser = ref<GetBlacklist.Response['data']['blacklist'][0] | null>(
  null
)
const operationPopupConfig = reactive({
  show: false,
  duration: 300,
  operationList: [
    {
      label: '解除拉黑',
      color: 'red',
      clickAction: async () => {
        if (!selectUser.value?.id) {
          return
        }
        await unblockUser({
          blockedUserId: selectUser.value?.id,
        })
        blackList.value = blackList.value.filter(
          (item) => item.id !== selectUser.value?.id
        )
        userStore.blacklist = blackList.value.map((item) => item.id)
        operationPopupConfig.show = false
        uni.showToast({
          title: '解除拉黑成功',
          icon: 'none',
        })
      },
    },
  ],
})
</script>
