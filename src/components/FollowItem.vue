<template>
  <view
    class="grid grid-cols-[auto_1fr_auto] p-[18px_15px] b-b b-b-solid b-b-#f2f2f2"
  >
    <view class="flex">
      <up-avatar
        class="mx-8px"
        :src="baseURL + '' + props.userAvatarLink"
        :size="40"
      />
    </view>
    <view class="grid gap-row-5px">
      <view class="text-15px">
        {{ props.userNickname }}
      </view>
      <view class="flex gap-col-8px text-12px text-#737373">
        <view>开始关注了你</view>
        <view>{{ dayjs(props.createTime).format('YYYY-MM-DD') }}</view>
      </view>
    </view>
    <view class="flex items-center">
      <up-button
        plain
        :shape="'circle'"
        :color="rightBtnTypeMap[props.buttonType].color"
      >
        {{ rightBtnTypeMap[props.buttonType].label }}
      </up-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import { FollowProps } from '@/service/types/db'
import dayjs from 'dayjs'

const props = defineProps<
  Pick<FollowProps, 'id' | 'createTime'> & {
    userId: number
    /** 按钮类型 */
    buttonType: 'hasFollow' | 'mutualFollow' | 'returnFollow' | 'sendMsg'
    /** 被关注用户昵称 */
    userNickname: string
    /** 被关注用户头像链接 */
    userAvatarLink: string
    /** 简介 */
    desc: string
  }
>()

const rightBtnTypeMap = {
  hasFollow: {
    label: '已关注',
    color: 'black',
  },
  mutualFollow: {
    label: '互相关注',
    color: 'black',
  },
  sendMsg: {
    label: '发私信',
    color: 'black',
  },
  returnFollow: {
    label: '回关',
    color: 'var(--primary-color)',
  },
}
</script>
