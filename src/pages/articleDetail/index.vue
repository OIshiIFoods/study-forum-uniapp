<template>
  <view class="px-10px min-h-100vh">
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
        v-if="userInfo?.userId !== userStore.id"
        :custom-style="{
          borderColor: 'var(--primary-color)',
          width: 'auto',
          margin: '0',
        }"
        :color="'var(--primary-color)'"
        :size="'small'"
        :shape="'circle'"
        :icon="isFollow ? 'checkmark' : ''"
        :iconColor="'white'"
        :text="isFollow ? '已关注' : '关注'"
        @click="
          async () => {
            const hasFollow = isFollow
            await followUser({
              followedUserId: userInfo!.userId,
              isFollow: !hasFollow,
            })
            await userStore.syncUserInfo()
            mV.uni.showToast({
              title: hasFollow ? '取消关注成功' : '关注成功',
              icon: 'none',
            })
          }
        "
      />
    </view>
    <view class="mt-15px">
      <view class="text-[#333] text-[20px] font-700">
        {{ articleInfo?.title }}
      </view>
      <up-line />
      <view class="mt-10px">
        <up-parse :content="articleInfo?.content" />
      </view>
      <view class="my-15px text-[#999] text-[12px]">
        {{ dayjs(articleInfo?.updateTime).format('YYYY-MM-DD') }}
      </view>
      <up-line />
    </view>
    <CommentSection
      ref="commentSecRef"
      v-model:comment-data="commentData"
      :onLike="likeComment"
      :onDelete="delComment"
      :onAdd="addComment"
    />
  </view>
  <view class="flex sticky bottom-0 bg-white p-10px b-t b-t-solid b-t-#ebeced">
    <input
      class="flex-1 bg-[rgba(224,224,224,.5)] p-[6px_12px] text-14px text-[rgb(216,216,216)] rounded-full"
      placeholder="说点什么"
      disabled
      @click="commentSecRef?.showCommentInputSection"
    />
    <view class="flex items-center gap-10px ml-20px">
      <up-icon
        :name="
          articleInfo?.collectedUsers.includes(userStore.id ?? 0)
            ? 'star-fill'
            : 'star'
        "
        :color="
          articleInfo?.collectedUsers.includes(userStore.id ?? 0)
            ? '#FFA500'
            : ''
        "
        :size="30"
        :label="articleInfo?.collectedUsers.length ?? 0"
        @click="
          async () => {
            if (!articleInfo?.id) {
              mV.uni.showToast({
                title: '文章不存在',
                icon: 'none',
              })
              return
            }
            const isCollected = articleInfo?.collectedUsers.includes(
              userStore.id ?? 0
            )
            await collectArticle({
              articleId: articleInfo?.id,
              isCollected: isCollected ? 0 : 1,
            })
            if (isCollected) {
              articleInfo.collectedUsers.splice(
                articleInfo.collectedUsers.indexOf(userStore.id!),
                1
              )
            } else {
              articleInfo.collectedUsers.push(userStore.id!)
            }
          }
        "
      />
      <up-icon
        :name="
          articleInfo?.likedUsers.includes(userStore.id ?? 0)
            ? 'thumb-up-fill'
            : 'thumb-up'
        "
        :color="
          articleInfo?.likedUsers.includes(userStore.id ?? 0) ? '#59a3f4' : ''
        "
        :size="30"
        :label="articleInfo?.likedUsers.length ?? 0"
        @click="
          async () => {
            if (!articleInfo?.id) {
              mV.uni.showToast({
                title: '文章不存在',
                icon: 'none',
              })
              return
            }
            const isLiked = articleInfo?.likedUsers.includes(userStore.id ?? 0)
            await likeArticle({
              articleId: articleInfo?.id,
              isLiked: isLiked ? 0 : 1,
            })
            if (isLiked) {
              articleInfo.likedUsers.splice(
                articleInfo.likedUsers.indexOf(userStore.id!),
                1
              )
            } else {
              articleInfo.likedUsers.push(userStore.id!)
            }
          }
        "
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import { baseURL } from '@/api/http'
import { useUserStore } from '@/stores'
import {
  addArticleComment,
  collectArticle,
  deleteArticleComment,
  followUser,
  getArticleCommentList,
  getArticleDetailInfo,
  likeArticle,
  likeArticleComment,
} from '@/service'
import type {
  GetArticleCommentList,
  GetArticleDetailInfo,
} from '@/service/types/api'
import CommentSection from '@/components/CommentSection/index.vue'
import type {
  CommentDataModelProps,
  CommentSectionRefType,
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
const commentSecRef = ref<CommentSectionRefType>()
const commentData = ref<CommentDataModelProps>({
  userAvatarLink: '',
  commentCount: 0,
  commentList: [],
})
const isFollow = computed(() => {
  return userStore.followList?.find(
    (item) => item.followedUserId === userInfo.value?.userId
  )
    ? true
    : false
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

const delComment = async ({ commentId, affectCount }: OnDeleteProps) => {
  await deleteArticleComment({
    commentIdList: [commentId],
  })
  commentData.value.commentCount -= affectCount
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
      isAuthor: item.userId === userInfo.value?.userId,
    })),
  }
}

const mV = {
  uni,
}
</script>
