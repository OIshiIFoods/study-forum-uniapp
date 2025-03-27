<template>
  <view>
    <up-navbar title="消息" leftIcon="" :autoBack="false" placeholder />
    <view class="flex justify-around py-10px">
      <view
        class="pos-relative flex flex-col items-center justify-center gap-row-8px"
        v-for="msgCategory in msgCategories"
        :key="msgCategory.label"
        @click="msgCategory.clickAction()"
      >
        <up-icon
          :class="['p-6px', 'rounded-10px']"
          :style="{ backgroundColor: msgCategory.bgColor }"
          :name="msgCategory.icon"
          :size="30"
          :color="msgCategory.color"
        />
        <view class="text-12px">{{ msgCategory.label }}</view>
        <view
          class="pos-absolute pos-right-[-5px] pos-top-[-5px] flex items-center justify-center w-15px h-15px bg-[red] text-white rounded-half text-12px"
          v-if="msgCategory.unReadCount()"
        >
          {{ msgCategory.unReadCount() }}
        </view>
      </view>
    </view>
    <view>
      <view v-for="chatedUser in chatedUserList" :key="chatedUser.userId">
        <up-cell
          :title="chatedUser.nickname"
          :border="false"
          :label="chatedUser.latestMessage"
          @click="
            router.push({
              name: 'chat',
              params: { chatUserId: String(chatedUser.userId) },
            })
          "
        >
          <template #icon>
            <up-avatar
              shape="square"
              :size="35"
              :src="baseURL + '' + chatedUser.avatarLink"
              customStyle="margin: -3px 5px -3px 0"
            />
          </template>
          <template #value>
            <view
              class="self-stretch flex flex-col justify-between items-end text-13px"
            >
              <view class="text-#A9A9A9">{{ chatedUser.time }}</view>
              <view
                class="flex justify-center items-center w-15px h-15px bg-[red] text-white rounded-half"
                v-if="chatedUser.unReadCount"
              >
                {{ chatedUser.unReadCount }}
              </view>
            </view>
          </template>
        </up-cell>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import { useUserMessage } from '@/hooks/useUserMessage'
import router from '@/router'
import { getMessageList } from '@/service/modules/message'
import { useUserStore } from '@/stores'
import dayjs from 'dayjs'
import { computed, onMounted } from 'vue'
import { NoticeTypeEnum } from '@/service/types/db.d'
import { useNotice } from '@/hooks/useNotice'

const { messages, userInfos, addMessage, updateReadStatus } = useUserMessage()
const { notices } = useNotice()

onMounted(async () => {})
const userStore = useUserStore()
const msgCategories = [
  {
    icon: 'heart-fill',
    color: '#fe5957',
    bgColor: '#fddbd8',
    label: '赞和收藏',
    unReadCount: () =>
      notices.filter(
        (item) =>
          !item.isRead &&
          [
            NoticeTypeEnum.ArticleLiked,
            NoticeTypeEnum.ArticleLiked,
            NoticeTypeEnum.CommentLiked,
          ].includes(item.noticeType)
      ).length,
    clickAction: () => {
      router.push({
        name: 'notice',
        params: {
          title: '收到的赞和收藏',
          noticeType: JSON.stringify([
            NoticeTypeEnum.ArticleLiked,
            NoticeTypeEnum.ArticleLiked,
            NoticeTypeEnum.CommentLiked,
          ]),
        },
      })
    },
  },
  {
    icon: 'account-fill',
    color: '#2d8bff',
    bgColor: '#e2eefe',
    label: '新增关注',
    unReadCount: () =>
      notices.filter(
        (item) =>
          !item.isRead && [NoticeTypeEnum.Followed].includes(item.noticeType)
      ).length,
    clickAction: () => {
      router.push({
        name: 'notice',
        params: {
          title: '新增关注',
          noticeType: JSON.stringify([NoticeTypeEnum.Followed]),
        },
      })
    },
  },
  {
    icon: 'chat-fill',
    color: '#1cdf96',
    bgColor: '#d8f8ed',
    label: '回复',
    unReadCount: () =>
      notices.filter(
        (item) =>
          !item.isRead &&
          [NoticeTypeEnum.CommentReplied].includes(item.noticeType)
      ).length,
    clickAction: () => {
      router.push({
        name: 'notice',
        params: {
          title: '收到的评论',
          noticeType: JSON.stringify([NoticeTypeEnum.CommentReplied]),
        },
      })
    },
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
        dayjsTime: dayjs(latestMessage?.createTime),
        time: dayjs(latestMessage?.createTime).format('YYYY-MM-DD'),
        unReadCount: messages[id].filter((item) => !item.isRead).length,
        ...item,
      }
    })
    .sort((a, b) => +b.dayjsTime - +a.dayjsTime)
})
</script>

<style></style>
