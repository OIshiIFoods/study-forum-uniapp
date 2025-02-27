<template>
  <view class="p-10rpx">
    <view class="text-14px">共{{ commentCount }}条评论</view>
    <view class="flex items-center my-20px gap-col-12px">
      <up-avatar :src="userAvatarLink" :size="35" />
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
      v-for="(pCom, pComIndex) in commentList"
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
  </view>
</template>

<script setup lang="ts">
import { getEleFromTree } from '@/utils'
import type { CommentItemProps } from './components/CommentItem.vue'
import CommentItem from './components/CommentItem.vue'

type CmSevProps = {
  /** 评论总数 */
  commentCount: number
  /** 用户头像链接 */
  userAvatarLink?: string
  /** 评论列表 */
  commentList: (CommentItemProps & { children?: CommentItemProps[] })[]
  /** 点击头像事件回调, 返回true则继续执行后续逻辑 */
  onAvatarClick?: (
    userId: number
  ) => boolean | undefined | void | Promise<boolean | undefined | void>
  /** 点赞事件回调, 返回true则继续执行后续逻辑 */
  onLike?: (
    value: boolean,
    commentId: number,
    parentCommentId?: number
  ) => boolean | undefined | void | Promise<boolean | undefined | void>
  /** 删除事件回调, 返回true则继续执行后续逻辑 */
  onDelete?: (
    commentId: number,
    parentCommentId?: number
  ) => boolean | undefined | void | Promise<boolean | undefined | void>
}

const props = withDefaults(defineProps<CmSevProps>(), {
  userAvatarLink: '',
  commentCount: 0,
  commentList: () => [
    {
      id: 1, // 唯一主键
      userId: 1,
      parentId: undefined, // 所属评论的唯一主键
      owner: false, // 是否是拥有者，为true则可以删除，管理员全部为true
      hasLike: false, // 是否点赞
      likeCount: 2, // 点赞数量
      avatarLink: 'https://inews.gtimg.com/newsapp_ls/0/13797755537/0', // 评论者头像地址
      nickname: '超长昵称超长...', // 评论者昵称，昵称过长请在后端截断
      content: '啦啦啦啦', // 评论内容
      createTime: '2021-07-02 16:32:07', // 创建时间
      isAuthor: true,
      children: [
        {
          id: 2, // 唯一主键
          userId: 1,
          parentId: undefined, // 所属评论的唯一主键
          owner: false, // 是否是拥有者，为true则可以删除，管理员全部为true
          hasLike: false, // 是否点赞
          likeCount: 2, // 点赞数量
          avatarLink: 'https://inews.gtimg.com/newsapp_ls/0/13797755537/0', // 评论者头像地址
          nickname: '超长昵称超长...', // 评论者昵称，昵称过长请在后端截断
          content: '啦啦啦啦', // 评论内容
          createTime: '2021-07-02 16:32:07', // 创建时间
        },
      ],
    },
  ],
})

const deleteComment = async (commentId: number, parentCommentId?: number) => {}
const likeComment = async (
  value: boolean,
  commentId: number,
  parentCommentId?: number
) => {}

const replyComment = async (
  nickname: string,
  commentId: number,
  parentCommentId?: number
) => {}
</script>
