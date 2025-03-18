<template>
  <view>
    <up-navbar title="消息" leftIcon="" :autoBack="false" placeholder />
    <view class="flex justify-around py-10px">
      <view
        class="flex flex-col items-center justify-center gap-row-8px"
        v-for="msgCategory in msgCategories"
        :key="msgCategory.label"
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
    <view v-for="chatedUser in chatedUserList" :key="chatedUser.userId">
      {{ chatedUser.nickname }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserMessage } from '@/hooks/useUserMessage'
import { getMessageList } from '@/service/modules/message'
import { useUserStore } from '@/stores'
import dayjs from 'dayjs'
import { computed, onMounted } from 'vue'

const { messages, userInfos, addMessage, updateReadStatus } = useUserMessage()

onMounted(async () => {})
const userStore = useUserStore()
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
const chatedUserList = computed(() => {
  return Object.values(userInfos)
    .filter((value) => value.id !== userStore.id)
    .map(({ id, ...item }) => {
      const latestMessage = messages[id].at(-1)
      return {
        userId: id,
        latestMessage: latestMessage?.content,
        time: dayjs(latestMessage?.createTime).format('YYYY-MM-DD'),
        unReadCount: messages[id].filter((item) => !item.isRead).length,
        ...item,
      }
    })
})
</script>

<style></style>
