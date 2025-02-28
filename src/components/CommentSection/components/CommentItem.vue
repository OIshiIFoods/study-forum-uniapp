<template>
  <view class="flex gap-col-5px mt-10px">
    <up-avatar class="p-5px" :src="avatarLink" :size="avatarSize ?? 35" />
    <view class="flex-1">
      <view class="flex justify-between">
        <view class="flex items-center gap-col-5px">
          <!-- nickname 超出10个字符显示省略号 -->
          <view
            class="text-#919091 text-12px max-w-11em overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {{ nickname ?? '未知' }}
          </view>
          <view
            class="p-3px rounded-4px text-10px text-[var(--primary-color)] bg-[var(--shallow-primary-color)]"
            v-if="isAuthor"
          >
            作者
          </view>
        </view>
        <up-icon
          class="justify-self-end"
          :label="likeCount"
          :labelPos="'left'"
          :name="hasLike ? 'thumb-up-fill' : 'thumb-up'"
          :color="hasLike ? 'var(--primary-color)' : '#919091'"
          :size="18"
          @click="emit('like', hasLike, id, parentId)"
        />
      </view>
      <view class="text-12px my-6px">{{ content }}</view>
      <view class="flex gap-col-6px text-10px">
        <view class="text-#919091">{{ createTime }}</view>
        <view @click="emit('reply', nickname, id, parentId)">回复</view>
        <view v-if="owner" @click="emit('delete', id, parentId)">删除</view>
      </view>
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
export type CommentItemProps = {
  /** 评论 id */
  id: number
  /** 该评论的父级id */
  parentId?: number
  /** 评论用户的id */
  userId?: number
  /** 评论者昵称 */
  nickname: string
  /** 头像链接 */
  avatarLink: string
  /** 头像大小，默认35 */
  avatarSize?: number
  /** 评论内容 */
  content: string
  /** 是否为该评论拥有者 */
  owner: boolean
  /** 是否已经点赞 */
  hasLike: boolean
  /** 该评论被点赞数量 */
  likeCount?: number
  /** 评论创建时间 */
  createTime: string
  /** 是否是作者的评论 */
  isAuthor?: boolean
}

const props = defineProps<CommentItemProps>()

const emit = defineEmits(['like', 'delete', 'reply'])
</script>
