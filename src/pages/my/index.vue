<template>
  <view>
    <up-navbar title="" leftIcon="" placeholder />
    <!-- 信息概要 -->
    <view class="p-[0_calc(var(--page-side-unit-size)*8)]">
      <!-- 主要信息 -->
      <view v-if="userStore.id" class="flex position-relative p-[5px_0]">
        <image
          class="w-[65px] h-[65px] rounded-full"
          :src="baseURL + '' + userStore.avatarLink"
          mode="aspectFill"
        />
        <view class="ml-[20px] flex flex-col justify-center">
          <view class="text-[16px] p-[5px_0]">{{ userStore.nickname }}</view>
          <view class="text-[var(--text-color-grey)] text-[12px]">
            {{ userStore.signature }}
          </view>
        </view>
        <!-- 空间控件 -->
        <view
          class="pos-absolute pos-top-[50%] pos-right-none transform-translate-y-[-50%] text-[var(--text-color-grey)] text-[12px]"
          @click=""
        >
          空间 >
        </view>
      </view>
      <view
        v-else
        class="flex p-[5px_20px] items-center"
        @click="() => router.push({ name: 'login' })"
      >
        <up-icon name="account-fill" size="50" color="var(--text-color-grey)" />
        <view class="text-[15px] font-700 ml-[10px]">请点击登录</view>
      </view>
      <!-- 其他信息 -->
      <view>
        <!-- 账户状态信息列表 -->
        <view class="flex m-[35rpx_0] p-0">
          <view
            class="pos-relative flex-1 flex flex-col items-center"
            v-for="(item, index) in accountStatusInfoList"
            :key="item.title"
          >
            <view class="text-[14px] mb-[3px]">{{ item.value }}</view>
            <view class="text-[10px] text-[var(--text-color-grey)]">
              {{ item.title }}
            </view>
            <up-line
              v-if="index !== accountStatusInfoList.length - 1"
              class="pos-absolute pos-right-0 pos-top-15%"
              direction="col"
              length="70%"
            />
          </view>
        </view>
        <view
          v-if="userStore.id"
          class="flex justify-around items-end m-[20px_0_12px]"
        >
          <view
            v-for="(item, index) in managementList"
            :key="index"
            @click="item.clickAction"
            class="flex flex-col items-center"
          >
            <view
              class="text-[var(--primary-color)] iconfont"
              :class="'icon-' + item.icon"
              :style="{ fontSize: item.iconSize }"
            />
            <text class="text-[12px] mt-[8px]">{{ item.title }}</text>
          </view>
        </view>
      </view>
    </view>
    <!-- 其他服务 -->
    <up-cell-group class="other-service">
      <up-cell
        v-for="item in otherServiceList"
        :title="item.title"
        @click="item.clickAction"
        :key="item.title"
        is-link
        clickable
      >
        <template #icon>
          <view
            class="text-[var(--primary-color)] text-22px iconfont"
            :class="'icon-' + item.icon"
          />
        </template>
      </up-cell>
    </up-cell-group>
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import router from '@/router'
import { useUserStore } from '@/stores'
import { computed } from 'vue'
const userStore = useUserStore()

const accountStatusInfoList = computed(() => [
  {
    title: '点赞',
    value: userStore.likeCount,
  },
  {
    title: '收藏',
    value: userStore.collectionCount,
  },
  {
    title: '关注',
    value: userStore.followCount,
  },
  {
    title: '粉丝',
    value: userStore.fansCount,
  },
])

const managementList = [
  {
    title: '帖子管理',
    icon: 'post-management',
    iconSize: '27px',
    clickAction: () => router.push({ name: 'postManagement' }),
  },
  {
    title: '文件管理',
    icon: 'file-management',
    iconSize: '35px',
    clickAction: () => router.push({ name: 'fileManagement' }),
  },
]

const otherServiceList = [
  {
    title: '设置',
    icon: 'setting',
    clickAction: () => router.push({ name: 'setting' }),
  },
]
</script>
