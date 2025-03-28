<template>
  <up-navbar :title="pageTitle" auto-back placeholder />
  <view
    class="grid grid-cols-[auto_1fr_auto] p-[18px_15px] b-b b-b-solid b-b-#f2f2f2"
    v-for="notice in noticeList.filter((notice) =>
      noticeTypeList.includes(notice.noticeType)
    )"
    :key="notice.id"
    @longpress="
      () => {
        curSelectNotice = notice
        operationPopupConfig.show = true
      }
    "
    @click="
      () => {
        if (
          [
            NoticeTypeEnum.ArticleLiked,
            NoticeTypeEnum.ArticleLiked,
            NoticeTypeEnum.CommentLiked,
            NoticeTypeEnum.CommentReplied,
          ].includes(notice.noticeType)
        ) {
          router.push({
            name: 'articleDetail',
            params: { articleId: notice.content.articleId },
          })
        }
      }
    "
  >
    <view class="flex">
      <up-avatar
        class="mx-8px"
        :src="baseURL + '' + usersInfoInNotice[notice.senderId].avatarLink"
        :size="40"
        @click.stop="
          router.push({
            name: 'userSpace',
            params: { userId: String(notice.senderId) },
          })
        "
      />
    </view>
    <view class="grid gap-row-5px">
      <view class="text-15px">
        {{ usersInfoInNotice[notice.senderId]?.nickname }}
      </view>
      <view class="flex gap-col-8px text-12px text-#737373">
        <view>{{ noticeTypeMap[notice.noticeType].desc }}</view>
        <view>{{ dayjs(notice.createTime).format('YYYY-MM-DD') }}</view>
      </view>
      <view class="text-15px">
        {{ notice.content.title }}
      </view>
      <view class="flex items-center" v-if="notice.content.desc">
        <view class="w-4px rounded-2px py-3px mr-5px h-80% bg-[#e4e4e4]" />
        <view class="flex-1">
          <up-text
            :lines="2"
            :text="notice.content.desc"
            :color="'#737373'"
            :size="13"
          />
        </view>
      </view>
    </view>
    <view>
      <view
        v-if="notice.noticeType === NoticeTypeEnum.Followed"
        class="flex items-center h-full"
      >
        <up-button
          plain
          :size="'small'"
          :shape="'circle'"
          :color="followStatusMap[getFollowInfo(notice.senderId).status].color"
          @click.stop="
            async () => {
              followStatusMap[
                getFollowInfo(notice.senderId).status
              ].clickAction(notice.senderId)
            }
          "
        >
          {{ followStatusMap[getFollowInfo(notice.senderId).status].label }}
        </up-button>
      </view>
    </view>
  </view>
  <up-popup
    :show="operationPopupConfig.show"
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
import { useNotice } from '@/hooks/useNotice'
import router from '@/router'
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { computed, reactive, ref, watch } from 'vue'
import { type NoticeProps, NoticeTypeEnum } from '@/service/types/db.d'
import { useUserStore } from '@/stores'
import { deleteNotices, followUser } from '@/service'

type OnloadOptionsType = {
  title?: string
  noticeType?: string
}

const pageTitle = ref('消息')
const noticeTypeList = ref<number[]>([])
const userStore = useUserStore()
const { notices, usersInfoInNotice, updateNoticeInfo, deleteNotice } =
  useNotice()
const noticeList = computed(() => {
  return notices
    .filter((notice) => noticeTypeList.value.includes(notice.noticeType))
    .sort((a, b) => +dayjs(b.createTime) - +dayjs(a.createTime))
})
const noticeTypeMap = {
  1: { desc: '赞了你的文章' },
  2: { desc: '收藏了你的文章' },
  3: { desc: '赞了你的评论' },
  4: { desc: '回复了你的评论' },
  5: { desc: '@了你' },
  6: { desc: '开始关注了你' },
}

const followStatusMap = {
  hasFollow: {
    label: '发消息',
    color: '',
    clickAction: (userId: number) => {
      router.push({
        name: 'chat',
        params: { chatUserId: String(userId) },
      })
    },
  },
  notFollow: {
    label: '回关',
    color: 'var(--primary-color)',
    clickAction: async (userId: number) => {
      await followUser({
        followedUserId: userId,
        isFollow: true,
      })
      await userStore.syncUserInfo()
    },
  },
}

const curSelectNotice = ref<
  Omit<NoticeProps, 'content'> & { content: Record<string, any> }
>()
const operationPopupConfig = reactive({
  show: false,
  operationList: [
    {
      label: '删除',
      color: 'red',
      clickAction: async () => {
        await deleteNotice({
          noticeIdList: [curSelectNotice.value!.id],
        })
        uni.showToast({
          title: '删除成功',
          icon: 'none',
        })
        operationPopupConfig.show = false
      },
    },
  ],
})

watch(
  noticeList,
  async (newVal) => {
    const unreadList = newVal.filter((item) => !item.isRead)
    if (unreadList.length) {
      await updateNoticeInfo(
        unreadList.map((item) => ({ noticeId: item.id, isRead: true }))
      )
    }
  },
  {
    immediate: true,
  }
)

onLoad(async (options: any) => {
  const params = options as OnloadOptionsType
  params.title && (pageTitle.value = params.title)
  params.noticeType && (noticeTypeList.value = JSON.parse(params.noticeType))
})

const getFollowInfo = (
  userId: number
): {
  status: keyof typeof followStatusMap
  followInfo:
    | {
        id: number
        createTime: string
        userId: number
        isMutual: 0 | 1
        userNickname: string
        userAvatarLink: string
      }
    | undefined
} => {
  const followInfo = userStore.followList?.find(
    (item) => item.userId === userId
  )
  return {
    status: followInfo ? 'hasFollow' : 'notFollow',
    followInfo,
  }
}
</script>
