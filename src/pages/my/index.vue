<template>
  <view class="p-[0_calc(var(--page-side-unit-size)*8)]">
    <up-navbar title="" leftIcon="" placeholder />
    <!-- 信息概要 -->
    <view>
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
          @click="
            router.push({
              name: 'userSpace',
              params: { userId: String(userStore.id) },
            })
          "
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
      <!-- 账户状态信息列表 -->
      <view class="flex m-[35rpx_0] p-0">
        <view
          class="pos-relative flex-1 flex flex-col items-center"
          v-for="(item, index) in accountStatusInfoList"
          :key="item.title"
          @click.stop="() => item.clickAction()"
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
    </view>
    <!-- 发布文章 -->
    <view
      class="flex justify-between items-center m-[15px_0] box-border p-[10px_15px] bg-[linear-gradient(to_right,#fff,var(--shallow-primary-color))] b b-solid b-[var(--shallow-primary-color)] rounded-6px"
      v-if="userStore.id"
    >
      <view>
        <view class="flex p-[5px_0] items-center">
          <view
            class="text-[#fff] text-10px bg-[var(--primary-color)] p-[1px_1.5px] rounded-[2px]"
          >
            UP
          </view>
          <view class="text-14px">&nbsp; 发表你的文章</view>
        </view>
        <view class="text-10px text-[#bac0cb]">
          撰写文章，让更多人了解你的想法。
        </view>
      </view>
      <view
        class="flex items-center p-[5px_12px] rounded-full bg-[var(--primary-color)] text-white text-12px"
        @click="router.push({ name: 'publishArticle' })"
      >
        <view class="iconfont icon-upload text-16px" />
        发布文章
      </view>
    </view>
    <!-- 文件管理 -->
    <view class="m-[15px_0]">
      <view class="text-14px font-600 p-[5px_0]">文件管理</view>
      <view>
        <view class="flex justify-between items-center">
          <view class="text-14px p-[8px_0]">
            {{
              ~~((userStore.usedSpaceSize || 0) / 1024 ** 2) +
              'M/' +
              ~~((userStore.availableSpaceSize || 1) / 1024 ** 2) +
              'M'
            }}
          </view>
          <view
            class="text-12px text-[#ccc]"
            @click="router.push({ name: 'fileManagement' })"
          >
            管理文件 >
          </view>
        </view>
        <up-line-progress
          height="8"
          activeColor="#59a3f4"
          :percentage="
            (
              ((userStore.usedSpaceSize ?? 0) /
                (userStore.availableSpaceSize ?? 1)) *
              100
            ).toFixed(2)
          "
        />
        <view class="flex flex-wrap m-t-10px">
          <view
            class="flex flex-col items-center justify-center w-[25%] box-border p-[10px] overflow-hidden"
            v-for="item in fileManageFuncList"
            :key="item.title"
            @click="item.clickAction"
          >
            <view
              class="iconfont text-[22px] mb-[6px] text-[var(--primary-color)]"
              :class="'icon-' + item.icon"
            />
            <text class="text-[12px]">{{ item.title }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 更多服务 -->
    <view class="m-[15px_0]">
      <view class="text-14px font-600 p-[5px_0]">更多服务</view>
      <up-cell-group :border="false">
        <view
          v-for="item in otherServiceList"
          :key="item.title"
          class="pos-relative"
        >
          <up-cell
            :title="item.title"
            :title-style="{ fontSize: '14px' }"
            @click="item.clickAction"
            :border="false"
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
          <button
            v-if="item.icon === 'kefu'"
            class="absolute pos-left-0 pos-top-0 w-[100%] h-[100%] bg-[rgba(0,0,0,0)] after:b-0"
            open-type="contact"
          />
        </view>
      </up-cell-group>
    </view>
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import router from '@/router'
import { useUserStore } from '@/stores'
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
const userStore = useUserStore()

onShow(async () => {
  await userStore.syncUserInfo()
})

const accountStatusInfoList = computed(() => [
  {
    title: '点赞',
    value: userStore.likeCount,
    clickAction: () => {
      router.push({
        name: 'myArticle',
      })
    },
  },
  {
    title: '收藏',
    value: userStore.collectionCount,
    clickAction: () => {
      router.push({
        name: 'myArticle',
      })
    },
  },
  {
    title: '关注',
    value: userStore.followCount,
    clickAction: () => {
      router.push({
        name: 'myFollow',
      })
    },
  },
  {
    title: '粉丝',
    value: userStore.fansCount,
    clickAction: () => {
      router.push({
        name: 'myFollow',
      })
    },
  },
])

const fileManageFuncList = [
  {
    title: '回收站',
    icon: 'delete',
    iconSize: '27px',
    clickAction: () => router.push({ name: 'fileRecycleBin' }),
  },
]

const otherServiceList = [
  {
    title: '联系客服',
    code: 'kefu',
    icon: 'kefu',
    clickAction: () => router.push({ name: 'setting' }),
  },
  {
    title: '设置',
    code: 'setting',
    icon: 'setting',
    clickAction: () => router.push({ name: 'setting' }),
  },
]
</script>
