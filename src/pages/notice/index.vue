<template>
  <up-navbar :title="pageTitle" auto-back placeholder />
  <view
    class="grid grid-cols-[auto_1fr_auto] p-[18px_15px] b-b b-b-solid b-b-#f2f2f2"
    v-for="notice in notices.filter((notice) =>
      noticeTypeList.includes(notice.noticeType)
    )"
    :key="notice.id"
    @click="
      () => {
        if (
          [
            NoticeTypeEnum.ArticleLiked,
            NoticeTypeEnum.ArticleLiked,
            NoticeTypeEnum.CommentLiked,
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
        :src="baseURL + '' + usersInfoInNotice[notice.senderId]"
        :size="40"
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
      <view class="flex items-center">
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
    <view></view>
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import { useNotice } from '@/hooks/useNotice'
import router from '@/router'
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { NoticeTypeEnum } from '@/service/types/db.d'

type OnloadOptionsType = {
  title?: string
  noticeType?: string
}

const pageTitle = ref('消息')
const noticeTypeList = ref<number[]>([])
const { notices, usersInfoInNotice } = useNotice()
const noticeTypeMap = {
  1: { desc: '赞了你的文章' },
  2: { desc: '收藏了你的文章' },
  3: { desc: '赞了你的评论' },
  4: { desc: '回复了你的评论' },
  5: { desc: '@了你' },
  6: { desc: '关注了你' },
}
onLoad(async (options: any) => {
  const params = options as OnloadOptionsType
  params.title && (pageTitle.value = params.title)
  params.noticeType && (noticeTypeList.value = JSON.parse(params.noticeType))
})
</script>
