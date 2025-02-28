<template>
  <view class="px-10px">
    <up-navbar placeholder auto-back :title="'坛友动态'" />
    <view class="flex items-center justify-between">
      <view class="flex items-center">
        <up-avatar
          class="mx-[10px]"
          :src="baseURL + '' + userInfo?.avatarLink"
          :size="40"
        />
        <view class="text-[#333] text-[16px]">
          {{ userInfo?.nickname }}
        </view>
      </view>
      <up-button
        :custom-style="{
          borderColor: 'var(--primary-color)',
          width: 'auto',
          margin: '0',
        }"
        :color="'var(--primary-color)'"
        :size="'small'"
        :shape="'circle'"
        :text="'关注'"
      />
    </view>
    <view class="my-15px">
      <view class="text-[#333] text-[20px] font-700">
        {{ articleInfo?.title }}
      </view>
      <up-line />
      <view class="my-10px">
        <up-parse :content="articleInfo?.content" />
      </view>
      <view class="py-5px text-[#999] text-[12px]">
        {{ dayjs(articleInfo?.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
      </view>
      <up-line />
    </view>
    <CommentSection
      v-model:comment-data="commentData"
      :onLike="likeComment"
      :onDelete="delComment"
      :onAdd="addComment"
    />
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { baseURL } from '@/api/http'
import { useUserStore } from '@/stores'
import {
  addArticleComment,
  deleteArticleComment,
  getArticleCommentList,
  getArticleDetailInfo,
  likeArticleComment,
} from '@/service'
import type {
  GetArticleCommentList,
  GetArticleDetailInfo,
} from '@/service/types/api'
import CommentSection from '@/components/CommentSection/index.vue'
import type {
  CmSecProps,
  CommentDataModelProps,
  OnAddCommentProps,
  OnDeleteProps,
  OnLikeProps,
} from '@/components/CommentSection/index.vue'

type OnloadParamType =
  | {
      articleId: string
    }
  | undefined

onLoad(async (param) => {
  const params = param as OnloadParamType
  if (!params?.articleId) {
    uni.showToast({
      title: '文章不存在',
      icon: 'none',
    })
    return
  }
  const { data: articleData } = await getArticleDetailInfo({
    articleId: Number(params.articleId),
  })
  userInfo.value = articleData.userInfo
  articleInfo.value = articleData.articleInfo
  commentData.value = formatCommentData(articleData.commentList)
})

const userStore = useUserStore()
const userInfo = ref<GetArticleDetailInfo.Response['data']['userInfo']>()
const articleInfo = ref<GetArticleDetailInfo.Response['data']['articleInfo']>()
const commentData = ref<CommentDataModelProps>({
  userAvatarLink: '',
  commentCount: 0,
  commentList: [],
})
const addComment = async ({
  conmentContent,
  toCommentId,
  toCommentParentId,
}: OnAddCommentProps) => {
  await addArticleComment({
    articleId: articleInfo.value!.id,
    content: conmentContent,
    // 若回复一级评论，则parentCommentId为该评论id
    parentCommentId: toCommentParentId ?? toCommentId,
    toCommentId: toCommentId,
  })
  await updateCommentList()
}

const delComment = async ({ commentId }: OnDeleteProps) => {
  await deleteArticleComment({
    commentIdList: [commentId],
  })
  commentData.value.commentCount--
}

const likeComment = async ({ commentId }: OnLikeProps) => {
  await likeArticleComment({
    commentId,
  })
}

const updateCommentList = async () => {
  const { data } = await getArticleCommentList({
    articleId: articleInfo.value?.id,
  })
  commentData.value = formatCommentData(data.commentList)
}

const formatCommentData = (
  commentList: GetArticleCommentList.Response['data']['commentList']
) => {
  return {
    userAvatarLink: baseURL + '' + userStore.avatarLink,
    commentCount: commentList.length,
    commentList: commentList.map(({ parentCommentId, ...item }) => ({
      ...item,
      parentId: parentCommentId ?? undefined,
      createTime: dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
      avatarLink: baseURL + item.avatarLink,
      owner: item.userId === userStore.id,
      hasLike: JSON.parse(item.likedUserList)?.includes(userStore.id),
      likeCount: JSON.parse(item.likedUserList)?.length,
    })),
  }
}
</script>
