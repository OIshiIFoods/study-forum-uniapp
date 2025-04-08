<template>
  <!-- 导航条 -->
  <up-transition :show="navbarMode === 'light'">
    <up-navbar :title="userInfo.nickname" auto-back />
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
  <scroll-view
    v-if="userInfo.spaceOpenStatus"
    class="h-100vh"
    :scroll-y="true"
    scrollWithAnimation
    upper-threshold="60px"
    lower-threshold="60px"
    @scrolltoupper="() => (navbarMode = 'dark')"
    @scrolltolower="() => (navbarMode = 'light')"
  >
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
            :src="baseURL + '' + userInfo.avatarLink"
            :shape="'circle'"
            width="80px"
            height="80px"
          />
          <view class="w-350rpx">
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
              v-if="userInfo.id === userStore.id"
              class="line-height-30px text-12px text-center text-[var(--primary-color)] b b-solid b-[var(--primary-color)]"
              @click="router.push({ name: 'accountInfo' })"
            >
              编辑资料
            </view>
            <view v-else class="flex justify-center">
              <up-button
                plain
                :customStyle="{ width: '50%' }"
                :size="'small'"
                :shape="'circle'"
                color="var(--primary-color)"
                @click="
                  async () => {
                    router.push({
                      name: 'chat',
                      params: { chatUserId: String(userInfo.id) },
                    })
                  }
                "
              >
                发消息
              </up-button>
            </view>
          </view>
        </view>
        <view>
          <view class="line-height-30px">{{ userInfo.nickname }}</view>
          <view class="text-12px text-[#999]">{{ userInfo.signature }}</view>
        </view>
      </view>
    </view>
    <up-sticky :offsetTop="positionInfo.safeTop + positionInfo.navbarHeight">
      <view id="tab-bar">
        <up-tabs
          class="mt-15px bg-white"
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
      </view>
    </up-sticky>
    <scroll-view
      class="h-[calc(100vh-44px-42px)]"
      :scroll-y="true"
      :scroll-top="scrollViewRelatedProps.scrollTop"
      scrollWithAnimation
      @scroll="
        (e) => (scrollViewRelatedProps.old.scrollTop = e.detail.scrollTop)
      "
      @scrolltolower="
        async () => {
          if (scrollViewRelatedProps.isLower) return
          scrollViewRelatedProps.isLower = true
          await searchAction()
          scrollViewRelatedProps.isLower = false
        }
      "
    >
      <view class="px-15px">
        <view v-if="activeTab === 'dynamics'">
          <view v-if="articleList.length">
            <ArticleItem
              v-for="item in articleList"
              :articleItem="item"
              :key="item.id"
            />
            <up-loadmore
              height="50"
              icon
              :status="scrollViewRelatedProps.isLower ? 'loading' : 'nomore'"
            />
          </view>
          <view
            v-else
            class="flex flex-col justify-center items-center mt-60px"
          >
            <up-icon name="file-text" :size="40" />
            <view class="text-15px p-[10px_0]">暂无动态</view>
          </view>
        </view>
        <view v-if="activeTab === 'file'">
          <view
            class="flex flex-col justify-center items-center mt-60px"
            @click="
              userStore.id === userInfo.id
                ? router.push({ name: 'fileManagement' })
                : router.push({
                    name: 'fileShare',
                    params: { sharedUserId: String(userInfo.id) },
                  })
            "
          >
            <view class="text-[50px] iconfont icon-no-file" />
            <view class="text-15px p-[10px_0]">前往文件仓库 ></view>
          </view>
        </view>
      </view>
    </scroll-view>
  </scroll-view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import ArticleItem from '@/components/ArticleItem.vue'
import router from '@/router'
import { getArticleList, getUserInfo } from '@/service'
import type { GetArticleList, GetUserInfo } from '@/service/types/api'
import { useUserStore } from '@/stores'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, onMounted, reactive, ref } from 'vue'

type OnloadOptionsType = {
  userId: string
}

onLoad(async (options) => {
  const params = options as OnloadOptionsType
  if (!params.userId) {
    uni.showToast({
      title: '用户不存在',
      icon: 'none',
      duration: 2000,
    })
    setTimeout(() => {
      router.back()
    }, 2000)
  }
  // 初始化用户信息
  userInfo.id = +params.userId
  const getUserInfoRes = await getUserInfo({ userId: Number(params.userId) })
  Object.assign(userInfo, getUserInfoRes.data)
  // 权限校验
  if (!userInfo.spaceOpenStatus) {
    uni.showModal({
      content: '该用户未开放空间',
      showCancel: false,
      success: () => {
        router.back()
      },
    })
  }
})

onMounted(async () => {
  // 设置滚动区域的高度
  uni
    .createSelectorQuery()
    .select('#tab-bar')
    .boundingClientRect((data) => {
      const node = Array.isArray(data) ? data[0] : data
      positionInfo.tabarHeight = node.height!
      console.log('tabbar', node)
    })
    .exec()
  scrollViewRelatedProps.value.height =
    positionInfo.windowHeight -
    positionInfo.navbarHeight -
    positionInfo.tabarHeight -
    positionInfo.safeTop
})

const userInfo = reactive<Partial<GetUserInfo.Response['data']>>({})
const userStore = useUserStore()
const positionInfo = reactive({
  safeTop: uni.getSystemInfoSync().safeArea?.top ?? 0,
  windowHeight: uni.getSystemInfoSync().windowHeight,
  navbarHeight: 44,
  tabarHeight: 0,
})

const statusInfoList = computed(() => [
  {
    code: 'followCount',
    desc: '关注',
    value: userInfo.followCount,
  },
  {
    code: 'fansCount',
    desc: '粉丝',
    value: userInfo.fansCount,
  },
  {
    code: 'likeCount',
    desc: '获赞',
    value: userInfo.likeCount,
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
const scrollViewRelatedProps = ref({
  /** 滚动区域滚动条位置 */
  scrollTop: 0,
  /** 是否触底 */
  isLower: false,
  /** 滚动区域高度 */
  height: 0,
  /** 旧数据 */
  old: {
    scrollTop: 0,
  },
})

onShow(async () => {
  if (!userInfo.id) {
    return
  }
  articleList.value = []
  await searchAction()
})

const searchAction = async () => {
  const { data } = await getArticleList({
    userId: userInfo.id,
    orderBy: [{ field: 'createTime', direction: 'DESC' }],
    createTime: ['', articleList.value.at(-1)?.createTime ?? ''],
    limit: 6,
  })
  articleList.value.push(...data.articleList)
}
</script>
