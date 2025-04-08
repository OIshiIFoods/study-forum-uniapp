<template>
  <view class="p-[16px_8px]">
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
      @clickAvatar="onClickAvatar"
    >
      <CommentItem
        v-for="(sCom, sComIndex) in pCom.children"
        :key="sCom.id"
        v-bind="sCom"
        :avatarSize="20"
        @delete="deleteComment"
        @like="likeComment"
        @reply="onClickReplyComment"
        @clickAvatar="onClickAvatar"
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
import {
  getEleFromTree,
  transformListToTree,
  transformTreeToList,
} from '@/utils'
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
  /** 删除时影响到的评论数量 */
  affectCount: number
}

export type OnAddCommentProps = {
  /** 回复的评论id */
  toCommentId?: number
  /** 回复的评论父级id */
  toCommentParentId?: number
  /** 评论内容 */
  conmentContent: string
}

export type OnClickAvatarProps = {
  /** 用户id */
  userId: number
}

export type CmSecProps = {
  /** 点击头像事件回调, 返回true则继续执行后续逻辑 */
  onAvatarClick?: (
    params: OnClickAvatarProps
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
  onAvatarClick: () => {},
})

const commentData = defineModel<CommentDataModelProps>('commentData', {
  default: () => ({
    commentCount: 0,
    userAvatarLink: '',
    commentList: [],
  }),
})

const treeCommentList = computed(() => {
  const newCommentList = transformListToTree(
    JSON.parse(
      JSON.stringify(commentData.value.commentList)
    ) as CommentItemProps[],
    'id',
    'parentId'
  )
  const sortComment = (comments: any, direction: 'asc' | 'desc' = 'desc') => {
    if (comments?.length) {
      comments.sort((a: any, b: any) => {
        return direction === 'asc'
          ? +new Date(a.createTime) - +new Date(b.createTime)
          : +new Date(b.createTime) - +new Date(a.createTime)
      })
      comments.forEach((commentItem: any) => {
        if (commentItem.children?.length) {
          sortComment(commentItem.children, 'asc')
        }
      })
    }
  }
  sortComment(newCommentList)
  return newCommentList
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
  // 从评论的树结构中获取评论信息
  const commentInfo = getEleFromTree(
    treeCommentList.value,
    commentId,
    'id',
    'children'
  )
  if (!commentInfo) return
  const { path: index, value: comment } = commentInfo
  const toDeleteComments = transformTreeToList([comment], 'children').map(
    (item) => item.id
  )
  const success = await props.onDelete({
    commentId,
    parentCommentId,
    comment,
    affectCount: toDeleteComments.length,
  })
  if (success === false) {
    return
  }
  commentData.value.commentList = commentData.value.commentList.filter(
    (item) => !toDeleteComments.includes(item.id)
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
  editorRef.value!.inputContent.placeholder = parentCommentId
    ? `回复 ${nickname}：`
    : ''
  addCommentInfo.value = {
    toCommentId: commentId,
    toCommentParentId: parentCommentId,
  }
}

const onClickAddComment = async () => {
  editorRef.value!.isShowPopup = true
}

const onClickAvatar = async (userId: number) => {
  await props.onAvatarClick({ userId })
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

export type CommentSectionRefType = {
  showCommentInputSection: () => true
}

defineExpose({
  showCommentInputSection: () => (editorRef.value!.isShowPopup = true),
})
</script>
