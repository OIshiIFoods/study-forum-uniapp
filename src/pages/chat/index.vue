<template>
  <view class="grid grid-rows-[auto_1fr_auto] h-100vh">
    <up-navbar placeholder>
      <template #left>
        <view class="flex items-center">
          <up-icon :name="'arrow-left'" :size="20" />
          <view class="flex items-center gap-col-5px ml-12px">
            <up-avatar
              shape="circle"
              :size="40"
              :src="baseURL + '' + userInfos[chatUserId]?.avatarLink"
              customStyle="margin: -3px 5px -3px 0"
            />
            <view class="text-15px">
              {{ userInfos[chatUserId]?.nickname }}
            </view>
          </view>
        </view>
      </template>
    </up-navbar>
    <view class="overflow-auto">
      <view
        class="px-10px"
        v-for="(messageItem, index) in messages[chatUserId]"
        :key="messageItem.id"
      >
        <view
          v-if="
            index === 0 ||
            +dayjs(messageItem.createTime) -
              +dayjs(messages[chatUserId][index - 1].createTime) >
              1000 * 60 * 3
          "
          class="flex justify-center text-#A9A9A9 text-12px my-5px"
        >
          {{ dayjs(messageItem.createTime).format('YYYY-MM-DD HH:mm') }}
        </view>
        <view
          class="flex py-8px"
          :class="
            messageItem.senderId === userStore.id ? 'flex-row-reverse' : ''
          "
        >
          <up-avatar
            shape="circle"
            :size="40"
            :src="baseURL + '' + userInfos[messageItem.senderId]?.avatarLink"
            customStyle="margin: -3px 5px -3px 0"
          />
          <view
            class="p-8px bg-[var(--primary-color)] text-white text-14px rounded-5px max-w-full break-all"
          >
            {{ messageItem.content }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import { useUserMessage } from '@/hooks/useUserMessage'
import router from '@/router'
import { useUserStore } from '@/stores'
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { ref } from 'vue'

const chatUserId = ref(0)

onLoad(async (params: any) => {
  if (!params.chatUserId) {
    uni.showToast({
      title: '聊天对象不存在',
      icon: 'none',
      duration: 2000,
    })
    setTimeout(() => {
      router.back()
    }, 2000)
    return
  }
  chatUserId.value = Number(params.chatUserId)
})

const { messages, userInfos } = useUserMessage()
const userStore = useUserStore()
</script>
