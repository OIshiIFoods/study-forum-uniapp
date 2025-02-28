<template>
  <view class="p-10rpx">
    <view class="text-14px">共{{ commentData.commentCount }}条评论</view>
    <view class="flex items-center my-20px gap-col-12px">
      <up-avatar :src="commentData.userAvatarLink" :size="35" />
      <input
        class="flex-1 bg-[rgba(224,224,224,.5)] p-[8px_12px] text-14px text-[rgb(216,216,216)] rounded-full"
        placeholder="留下你的想法吧"
        disabled
        @click="onClickAddComment"
      />
    </view>
    <CommentItem
      v-if="commentData.commentList.length > 0"
      v-for="(pCom, pComIndex) in treeCommentList"
      :key="pCom.id"
      v-bind="pCom"
      @delete="deleteComment"
      @like="likeComment"
      @reply="onClickReplyComment"
    >
      <CommentItem
        v-for="(sCom, sComIndex) in pCom.children"
        :key="sCom.id"
        v-bind="sCom"
        :avatarSize="20"
        @delete="deleteComment"
        @like="likeComment"
        @reply="onClickReplyComment"
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
    <CommmentEditor ref="editorRef" @send="onSend" />
  </view>
</template>

<script setup lang="ts">
import { transformListToTree } from '@/utils'
import type { CommentItemProps } from './components/CommentItem.vue'
import CommentItem from './components/CommentItem.vue'
import CommmentEditor, {
  type EditorRefType,
} from './components/CommentEditor.vue'
import { computed, ref, watch } from 'vue'

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

export type OnAddCommentProps = {
  /** 回复的评论id */
  toCommentId?: number
  /** 回复的评论父级id */
  toCommentParentId?: number
  /** 评论内容 */
  conmentContent: string
}

export type CmSecProps = {
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
  /** 新增事件回调, 返回true则继续执行后续逻辑 */
  onAdd?: (
    params: OnAddCommentProps
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
  onLike: () => {},
  onDelete: () => {},
  onAdd: () => {},
})

const commentData = defineModel<CommentDataModelProps>('commentData', {
  default: () => ({
    commentCount: 0,
    userAvatarLink: '',
    commentList: [],
  }),
})

const treeCommentList = computed(() => {
  return transformListToTree(commentData.value.commentList, 'id', 'parentId')
})

const editorRef = ref<EditorRefType>()
/** 新增评论信息 */
const addCommentInfo = ref<{
  /** 回复的评论id */
  toCommentId?: number
  /** 被回复评论的父级id */
  toCommentParentId?: number
}>()

/** 当弹窗收缩时，重置相关数据 */
watch(
  () => editorRef.value?.isShowPopup,
  (val) => {
    if (!val) {
      addCommentInfo.value = {}
    }
  }
)

const deleteComment = async (commentId: number, parentCommentId?: number) => {
  const isDelte = await new Promise((resolve) => {
    uni.showModal({
      content: '确认删除这条评论？',
      success: () => {
        resolve(true)
      },
      fail: (fail) => {
        resolve(false)
      },
    })
  })
  if (isDelte === false) return
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

const onClickReplyComment = async (
  nickname: string,
  commentId: number,
  parentCommentId?: number
) => {
  editorRef.value!.isShowPopup = true
  editorRef.value!.inputContent.placeholder = `回复 ${nickname}：`
  addCommentInfo.value = {
    toCommentId: commentId,
    toCommentParentId: parentCommentId,
  }
}

const onClickAddComment = async () => {
  editorRef.value!.isShowPopup = true
}

const onSend = async () => {
  const success = await props.onAdd({
    conmentContent:
      editorRef.value!.inputContent.placeholder +
      editorRef.value!.inputContent.content,
    ...addCommentInfo.value,
  })
  if (success === false) return
  editorRef.value!.isShowPopup = false
}
</script>
