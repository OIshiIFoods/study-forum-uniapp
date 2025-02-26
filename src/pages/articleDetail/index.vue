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
    <Comment
      ref="commentArea"
      @add="addComment"
      @del="delComment"
      @like="likeComment"
      :deleteTip="'确认删除？'"
      :cmData="treeCommentList"
    />
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import Comment from '@/components/Comment.vue'
import {
  addArticleComment,
  deleteArticleComment,
  getArticleCommentList,
  getArticleDetailInfo,
  likeArticleComment,
} from '@/service'
import type { GetArticleDetailInfo } from '@/service/types/api'
import { transformListToTree } from '@/utils'
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { computed, ref } from 'vue'

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
  commentList.value = articleData.commentList
})

const userInfo = ref<GetArticleDetailInfo.Response['data']['userInfo']>()
const articleInfo = ref<GetArticleDetailInfo.Response['data']['articleInfo']>()
const commentList = ref<GetArticleDetailInfo.Response['data']['commentList']>(
  []
)
const commentArea = ref()

const treeCommentList = computed(() => {
  const newList = commentList?.value.map((item) => ({
    ...item,
    createTime: dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
    avatarLink: baseURL + item.avatarLink,
    owner: item.userId === userInfo.value?.userId,
    hasLike: JSON.parse(item.likedUserList)?.includes(userInfo.value?.userId),
    likeCount: JSON.parse(item.likedUserList)?.length,
  }))
  return {
    comment: transformListToTree(newList ?? [], 'id', 'parentCommentId'),
  }
})

const addComment = async ({
  content,
  pId,
  toId,
}: {
  content: string
  pId: number
  toId: number
}) => {
  await addArticleComment({
    articleId: articleInfo.value!.id,
    content,
    parentCommentId: pId,
    toCommentId: toId,
  })
  await updateCommentList()
  commentArea.value?.addComplete()
}

const delComment = async (commentId: number) => {
  await deleteArticleComment({
    commentIdList: [commentId],
  })
  commentArea.value?.deleteComplete(commentId)
}

const likeComment = async (commentId: number) => {
  await likeArticleComment({
    commentId,
  })
  commentArea.value?.likeComplete(commentId)
}

const updateCommentList = async () => {
  const { data } = await getArticleCommentList({
    articleId: articleInfo.value?.id,
  })
  commentList.value = data.commentList
}
</script>
