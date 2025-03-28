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
    <view class="flex items-center gap-col-12px">
      <up-button
        plain
        :size="'small'"
        :shape="'circle'"
        :color="rightBtnTypeMap[props.buttonType].color"
        customStyle="border-color:#ededed;"
        @click="rightBtnTypeMap[props.buttonType].clickAction"
      >
        {{ rightBtnTypeMap[props.buttonType].label }}
      </up-button>
      <up-icon
        v-if="
          ['hasFollow', 'mutualFollow', 'sendMsg'].includes(props.buttonType)
        "
        name="more-dot-fill"
        @click="operationPopupConfig.show = true"
      />
    </view>
  </view>
  <up-popup
    :show="operationPopupConfig.show"
    :mode="'bottom'"
    :onClose="() => (operationPopupConfig.show = false)"
  >
    <view class="p-[15px_10px] bg-#f5f5f5">
      <view
        class="rounded-4px p-10px bg-#fff"
        v-for="(item, index) in operationPopupConfig.operationList"
        :key="item.label"
        :style="{ color: item.color }"
        @click="item.clickAction"
      >
        {{ item.label }}
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import router from '@/router'
import { followUser } from '@/service'
import type { FollowProps } from '@/service/types/db'
import dayjs from 'dayjs'
import { reactive } from 'vue'

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
const emit = defineEmits(['updateFollowItem', 'deleteFollowItem'])

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

const operationPopupConfig = reactive({
  show: false,
  operationList: [
    {
      label: '取消关注',
      color: 'red',
      clickAction: async () => {
        await followUser({
          followedUserId: props.userId,
          isFollow: false,
        })
        uni.showToast({
          title: '取消关注成功',
          icon: 'none',
        })
        if (['sendMsg', 'hasFollow'].includes(props.buttonType)) {
          emit('deleteFollowItem', props.id)
        } else if (props.buttonType === 'mutualFollow') {
          emit('updateFollowItem', props.id, {
            buttonType: 'returnFollow',
          })
        }
        operationPopupConfig.show = false
      },
    },
  ],
})
</script>
