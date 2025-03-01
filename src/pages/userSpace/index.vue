<template>
  <scroll-view
    class="h-100vh"
    :scroll-y="true"
    upper-threshold="60px"
    lower-threshold="60px"
    @scrolltoupper="() => (navbarMode = 'dark')"
    @scrolltolower="() => (navbarMode = 'light')"
  >
    <up-transition :show="navbarMode === 'light'">
      <up-navbar :title="userStore.nickname" auto-back />
    </up-transition>
    <up-transition :show="navbarMode === 'dark'">
      <up-navbar :bgColor="'rgba(0,0,0,0)'" auto-back>
        <template #left>
          <up-icon
            class="bg-[rgba(0,0,0,.4)] rounded-full p-[5px]"
            name="arrow-left"
            size="20"
            color="#fff"
          />
        </template>
      </up-navbar>
    </up-transition>
    <view
      class="transition-all transition-duration-300"
      :class="[navbarMode === 'light' ? 'opacity-0' : '']"
    >
      <image
        class="w-full"
        src="/static/images/spacePage/space-bg.png"
        mode="widthFix"
      />
      <!-- 用户信息栏 -->
      <view class="px-15px">
        <view class="relative flex justify-between">
          <up-image
            class="relative top-[-25px] left-[20px]"
            :src="baseURL + '' + userStore.avatarLink"
            :shape="'circle'"
            width="80px"
            height="80px"
          />
          <view>
            <!-- 账户状态信息列表 -->
            <view class="flex my-[20rpx]">
              <view
                class="relative flex-1 flex flex-col items-center"
                v-for="(item, index) in statusInfoList"
                :key="item.code"
              >
                <view class="text-14px mb-3px">{{ item.value }}</view>
                <view class="text-10px text-#999">{{ item.desc }}</view>
                <up-line
                  v-if="index !== statusInfoList.length - 1"
                  class="pos-absolute pos-right-0 pos-top-15%"
                  direction="col"
                  length="70%"
                />
              </view>
            </view>
            <!-- 编辑资料控件 -->
            <view
              class="w-350rpx line-height-30px text-12px text-center text-[var(--primary-color)] b b-solid b-[var(--primary-color)]"
              @click="router.push({ name: 'accountInfo' })"
            >
              编辑资料
            </view>
          </view>
        </view>
        <view>
          <view class="line-height-30px">{{ userStore.nickname }}</view>
          <view class="text-12px text-[#999]">{{ userStore.signature }}</view>
        </view>
      </view>
    </view>
    <view class="flex flex-col h-[calc(100vh-44px)]">
      <up-sticky offsetTop="44px">
        <up-tabs
          class="mt-15px"
          :list="tabbarItemList"
          :duration="200"
          lineHeight="2"
          lineWidth="45"
          lineColor="var(--primary-color)"
          :activeStyle="{
            color: 'var(--primary-color)',
            transform: 'scale(1.05)',
          }"
          itemStyle="flex:1; fontSize:14px; padding:10px 15px; borderBottom:1px solid #e4e4e4; borderTop:1px solid #e4e4e4"
          :onChange="(item: any) => (activeTab = item.code)"
        />
      </up-sticky>
      <view class="flex-1 overflow-auto px-15px bg-[#f1f2f4]">
        <view v-if="activeTab === 'dynamics'">
          <ArticleItem
            v-for="item in articleList"
            :articleItem="item"
            :key="item.id"
          />
        </view>
        <view class="h-full" v-if="activeTab === 'file'">
          <view
            class="flex flex-col justify-center items-center h-full"
            @click="router.push({ name: 'fileManagement' })"
          >
            <view class="text-[50px] iconfont icon-no-file" />
            <view class="text-15px p-[10px_0]">前往文件仓库 ></view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import ArticleItem from '@/components/ArticleItem.vue'
import router from '@/router'
import { getArticleList } from '@/service'
import type { GetArticleList } from '@/service/types/api'
import { useUserStore } from '@/stores'
import { computed, onMounted, reactive, ref } from 'vue'

const userStore = useUserStore()

const statusInfoList = computed(() => [
  {
    code: 'followCount',
    desc: '关注',
    value: userStore.followCount,
  },
  {
    code: 'fansCount',
    desc: '粉丝',
    value: userStore.fansCount,
  },
  {
    code: 'likeCount',
    desc: '获赞',
    value: userStore.likeCount,
  },
])

const tabbarItemList = [
  {
    code: 'dynamics',
    name: '动态',
  },
  {
    code: 'file',
    name: '文件',
  },
]

const activeTab = ref('dynamics')
const navbarMode = ref<'light' | 'dark'>('dark')

const articleList = ref<GetArticleList.Response['data']['articleList']>([])

onMounted(async () => {
  const { data } = await getArticleList({
    userId: userStore.id,
    orderBy: [{ field: 'createTime', direction: 'DESC' }],
  })
  articleList.value = data.articleList
})
</script>
