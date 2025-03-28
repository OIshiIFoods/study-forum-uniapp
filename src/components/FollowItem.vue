<template>
  <view
    class="grid grid-cols-[auto_1fr_auto] p-[18px_15px] b-b b-b-solid b-b-#f2f2f2"
  >
    <view class="flex">
      <up-avatar
        class="mx-8px"
        :src="baseURL + '' + props.userAvatarLink"
        :size="40"
        @click.stop="
          router.push({
            name: 'userSpace',
            params: { userId: String(props.userId) },
          })
        "
      />
    </view>
    <view class="grid gap-row-5px">
      <view class="text-15px">
        {{ props.userNickname }}
      </view>
      <view class="flex gap-col-8px text-12px text-#737373">
        <view v-if="props.desc">{{ props.desc }}</view>
        <view>{{ dayjs(props.createTime).format('YYYY-MM-DD') }}</view>
      </view>
    </view>
    <view class="flex items-center">
      <up-button
        plain
        :size="'small'"
        :shape="'circle'"
        :color="rightBtnTypeMap[props.buttonType].color"
        @click="rightBtnTypeMap[props.buttonType].clickAction"
      >
        {{ rightBtnTypeMap[props.buttonType].label }}
      </up-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import router from '@/router'
import { followUser } from '@/service'
import type { FollowProps } from '@/service/types/db'
import dayjs from 'dayjs'

export type FollowItemProps = Pick<FollowProps, 'id' | 'createTime'> & {
  userId: number
  /** 按钮类型 */
  buttonType: 'hasFollow' | 'mutualFollow' | 'returnFollow' | 'sendMsg'
  /** 被关注用户昵称 */
  userNickname: string
  /** 被关注用户头像链接 */
  userAvatarLink: string
  /** 简介 */
  desc?: string
}

const props = defineProps<FollowItemProps>()
const emit = defineEmits(['updateFollowItem'])

const rightBtnTypeMap = {
  hasFollow: {
    label: '已关注',
    color: 'black',
    clickAction: () => {},
  },
  mutualFollow: {
    label: '互相关注',
    color: 'black',
    clickAction: () => {},
  },
  sendMsg: {
    label: '发私信',
    color: 'black',
    clickAction: () => {
      router.push({
        name: 'chat',
        params: { chatUserId: String(props.userId) },
      })
    },
  },
  returnFollow: {
    label: '回关',
    color: 'var(--primary-color)',
    clickAction: async () => {
      await followUser({
        followedUserId: props.userId,
        isFollow: true,
      })
      uni.showToast({
        title: '关注成功',
        icon: 'success',
      })
      emit('updateFollowItem', props.id, {
        buttonType: 'mutualFollow',
      })
    },
  },
}
</script>
