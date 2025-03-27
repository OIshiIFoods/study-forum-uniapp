<template>
  <view class="flex flex-col h-100vh">
    <up-navbar placeholder>
      <template #left>
        <view class="flex items-center">
          <up-icon :name="'arrow-left'" :size="20" @click="router.back()" />
          <view class="flex items-center gap-col-5px ml-12px">
            <up-avatar
              shape="circle"
              :size="40"
              :src="baseURL + '' + userInfos[chatUserId]?.avatarLink"
              customStyle="margin: -3px 5px -3px 0"
              @click.stop="
                router.push({
                  name: 'userSpace',
                  params: { userId: String(chatUserId) },
                })
              "
            />
            <view class="text-15px">
              {{ userInfos[chatUserId]?.nickname }}
            </view>
          </view>
        </view>
      </template>
    </up-navbar>
    <view id="scroll-wrapper" class="flex-1">
      <scroll-view
        id="scroll-container"
        :style="{ height: scrollContainerProps.height + 'px' }"
        :scroll-into-view="scrollContainerProps.scrollIntoView"
        :scrollWithAnimation="scrollContainerProps.scrollWithAnimation"
        scroll-y
      >
        <view
          class="px-10px"
          v-for="(messageItem, index) in messages[chatUserId]"
          :key="messageItem.id"
          :id="'message' + (index + 1)"
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
              @click.stop="
                router.push({
                  name: 'userSpace',
                  params: { userId: String(messageItem.senderId) },
                })
              "
            />
            <view
              class="p-8px bg-[var(--primary-color)] text-white text-14px rounded-5px max-w-full break-all"
            >
              {{ messageItem.content }}
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="p-8px bg-white">
      <view class="flex items-center p-[4px_8px] bg-#f5f5f5 rounded-10px">
        <input
          class="flex-1 mx-8px text-13px"
          v-model="inputMessage"
          placeholder="发消息···"
          placeholderClass="text-#d5d5d5 text-13px"
        />
        <view class="flex gap-10px">
          <up-button
            :disabled="inputMessage.length === 0"
            :shape="'circle'"
            :type="'primary'"
            :size="'small'"
            @click="
              async () => {
                await sendMessage(chatUserId, inputMessage)
                inputMessage = ''
                scrollContainerProps.scrollIntoView =
                  'message' + messages[chatUserId].length
              }
            "
          >
            发送
          </up-button>
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
import { reactive, ref } from 'vue'

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
  await updateReadStatus(
    chatUserId.value,
    messages[chatUserId.value]?.map((item) => item.id) ?? []
  )
  initialScrollContainer()
})

const { messages, userInfos, sendMessage, updateReadStatus } = useUserMessage()
const userStore = useUserStore()
const inputMessage = ref('')
const chatUserId = ref(0)
const scrollContainerProps = reactive({
  height: 0,
  scrollIntoView: '',
  scrollWithAnimation: false,
})

const initialScrollContainer = () => {
  uni
    .createSelectorQuery()
    .select('#scroll-wrapper')
    .boundingClientRect((res) => {
      const nodeInfo = Array.isArray(res) ? res[0] : res
      Object.assign(scrollContainerProps, {
        height: nodeInfo.height!,
        scrollIntoView: 'message' + messages[chatUserId.value]?.length,
        scrollWithAnimation: true,
      })
    })
    .exec()
}
</script>
