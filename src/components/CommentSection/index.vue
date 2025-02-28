<template>
  <view class="p-10rpx">
    <view class="text-14px">共{{ commentData.commentCount }}条评论</view>
    <view class="flex items-center my-20px gap-col-12px">
      <up-avatar :src="commentData.userAvatarLink" :size="35" />
      <up-input
        :customStyle="{
          backgroundColor: 'rgba(224, 224, 224, .5)',
          padding: '5px 15px',
        }"
        fontSize="14px"
        color="rgba(216, 216, 216)"
        placeholder="留下你的想法吧"
        shape="circle"
        disabled
      />
    </view>
    <CommentItem
      v-if="commentData.commentList.length > 0"
      v-for="(pCom, pComIndex) in treeCommentList"
      :key="pCom.id"
      v-bind="pCom"
      @delete="deleteComment"
      @like="likeComment"
    >
      <CommentItem
        v-for="(sCom, sComIndex) in pCom.children"
        :key="sCom.id"
        v-bind="sCom"
        :avatarSize="20"
        @delete="deleteComment"
        @like="likeComment"
      />
    </CommentItem>
    <view v-else>
      <slot name="empty">
        <view class="flex flex-col justify-center items-center h-100px">
          <up-icon name="chat" :size="30" />
          <view class="text-[#A9A9A9] text-10px py-8px">还没有评论哦</view>
        </view>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { transformListToTree } from '@/utils'
import type { CommentItemProps } from './components/CommentItem.vue'
import CommentItem from './components/CommentItem.vue'
import { computed } from 'vue'

export type OnLikeProps = {
  value: boolean
  commentId: number
  parentCommentId?: number
  /** 该属性为响应式对象 */
  comment: CommentItemProps
}

export type OnDeleteProps = {
  commentId: number
  parentCommentId?: number
  /** 该属性为响应式对象 */
  comment: CommentItemProps
}

export type CmSecProps = {
  /** 评论唯一标识字段 */
  commentIdKey?: string
  /** 评论父级标识字段 */
  commentParentIdKey?: string
  /** 点击头像事件回调, 返回true则继续执行后续逻辑 */
  onAvatarClick?: (
    userId: number
  ) => boolean | undefined | void | Promise<boolean | undefined | void>
  /** 点赞事件回调, 返回true则继续执行后续逻辑 */
  onLike?: (
    params: OnLikeProps
  ) => boolean | undefined | void | Promise<boolean | undefined | void>
  /** 删除事件回调, 返回true则继续执行后续逻辑 */
  onDelete?: (
    params: OnDeleteProps
  ) => boolean | undefined | void | Promise<boolean | undefined | void>
}

export type CommentDataModelProps = {
  /** 评论总数 */
  commentCount: number
  /** 用户头像链接 */
  userAvatarLink?: string
  /** 评论列表 */
  commentList: CommentItemProps[]
}

const props = withDefaults(defineProps<CmSecProps>(), {
  commentIdKey: 'id',
  commentParentIdKey: 'parentId',
  onLike: () => {},
  onDelete: () => {},
})

const commentData = defineModel<CommentDataModelProps>('commentData', {
  default: () => ({
    commentCount: 0,
    userAvatarLink: '',
    commentList: [],
  }),
})

const treeCommentList = computed(() => {
  console.log(
    transformListToTree(
      commentData.value.commentList,
      props.commentIdKey,
      props.commentParentIdKey
    ),
    props.commentIdKey,
    props.commentParentIdKey
  )
  return transformListToTree(
    commentData.value.commentList,
    props.commentIdKey,
    props.commentParentIdKey
  )
})

const deleteComment = async (commentId: number, parentCommentId?: number) => {
  const comment = commentData.value.commentList.find(
    (item) => item.id === commentId
  )!
  const success = await props.onDelete({ commentId, parentCommentId, comment })
  if (success === false) {
    return
  }
  commentData.value.commentList = commentData.value.commentList.filter(
    (item) => item.id !== commentId
  )
  commentData.value.commentCount -= 1
}

const likeComment = async (
  value: boolean,
  commentId: number,
  parentCommentId?: number
) => {
  const comment = commentData.value.commentList.find(
    (item) => item.id === commentId
  )!
  const success = await props.onLike({
    value,
    commentId,
    parentCommentId,
    comment,
  })
  if (success === false) {
    return
  }
  comment.likeCount = comment.likeCount! + (comment.hasLike ? -1 : 1)
  comment.hasLike = comment.hasLike ? false : true
}

const replyComment = async (
  nickname: string,
  commentId: number,
  parentCommentId?: number
) => {}
</script>
