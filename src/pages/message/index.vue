<template>
  <view>
    <up-navbar title="消息" leftIcon="" :autoBack="false" placeholder />
    <view class="flex justify-around py-10px">
      <view
        class="flex flex-col items-center justify-center gap-row-8px"
        v-for="msgCategory in msgCategories"
      >
        <up-icon
          :class="['p-6px', 'rounded-10px']"
          :style="{ backgroundColor: msgCategory.bgColor }"
          :name="msgCategory.icon"
          :size="30"
          :color="msgCategory.color"
        />
        <view class="text-12px">{{ msgCategory.label }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {
  getChatedUserInfoList,
  getMessageList,
} from '@/service/modules/message'
import { GetchatedUsersInfo } from '@/service/types/api'
import type { UserMessageProps } from '@/service/types/db'
import { useUserStore } from '@/stores'
import { computed, onMounted, reactive, watch } from 'vue'

onMounted(async () => {
  // 获取未读聊天列表
  const getMsgListRes = await getMessageList({ isRead: '0' })
  messagelist.push(...getMsgListRes.data.messages)
})

const userStore = useUserStore()

const messagelist = reactive<UserMessageProps[]>(
  JSON.parse(uni.getStorageSync(userStore.id + 'message') ?? '[]')
)
const userInfoList = reactive<
  GetchatedUsersInfo.Response['data']['userInfoList']
>([] as any)

const msgCategories = [
  {
    icon: 'heart-fill',
    color: '#fe5957',
    bgColor: '#fddbd8',
    label: '赞和收藏',
  },
  {
    icon: 'account-fill',
    color: '#2d8bff',
    bgColor: '#e2eefe',
    label: '新增关注',
  },
  {
    icon: 'chat-fill',
    color: '#1cdf96',
    bgColor: '#d8f8ed',
    label: '评论和@',
  },
]

// 监听消息列表的变化更新用户信息列表
watch(messagelist, async (newVal) => {
  const hasInfoUserIds = userInfoList.map(({ id }) => id)
  const userIds = [
    userStore.id!,
    ...new Set(newVal.map(({ receiverId }) => receiverId)),
  ]
  const getUserInfoListRes = await getChatedUserInfoList({
    userIdList: userIds.filter((item) => !hasInfoUserIds.includes(item)),
  })
  userInfoList.push(...getUserInfoListRes.data.userInfoList)
})
</script>

<style></style>
