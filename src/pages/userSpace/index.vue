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
              class="flex-1 line-height-30px text-12px text-center text-[var(--primary-color)] b b-solid b-[var(--primary-color)]"
              @click="router.push({ name: 'accountInfo' })"
            >
              编辑资料
            </view>
            <view v-else class="flex items-center justify-center flex-1">
              <view
                v-if="userInfo.id !== userStore.id"
                class="text-[var(--primary-color)] text-22px iconfont mr-10px"
                :class="'icon-setting'"
                @click="operPopupConf.show = true"
              />
              <up-button
                plain
                :customStyle="{ width: '50%', margin: '0' }"
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
        <up-tabs
          v-if="activeTab === 'dynamics' && userInfo.id === userStore.id"
          class="bg-white b-b b-b-solid b-b-#e4e4e4"
          :list="articleStatusList"
          :duration="200"
          lineHeight="0"
          lineWidth="0"
          :activeStyle="{
            fontSize: '13px',
            color: 'black',
          }"
          :inactiveStyle="{
            fontSize: '13px',
            color: '#A9A9A9',
          }"
          itemStyle="padding:8px 13px;"
          :onChange="(item: any) => (activeArticleTab = item.code)"
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
          if (activeTab !== 'dynamics' || !articleList.length) return
          if (scrollViewRelatedProps.isLower) return
          scrollViewRelatedProps.isLower = true
          const { data } = await getArticleList({
            createTime: ['', articleList.at(-1)?.createTime ?? ''],
            ...baseSearchParams,
          })
          articleList.push(...data.articleList)
          scrollViewRelatedProps.isLower = false
        }
      "
    >
      <view class="px-15px">
        <view v-if="activeTab === 'dynamics'">
          <view class="mt-15px" v-if="articleList.length">
            <up-search
              placeholder="搜索文章"
              v-model="searchValue"
              :height="35"
              :bgColor="'#f8f9fd'"
              :actionStyle="{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'stretch',
                color: '#59a3f4',
                marginLeft: 0,
                backgroundColor: '#f8f9fd',
              }"
              :placeholderColor="'#a3a8af'"
              :inputStyle="{
                color: '#a3a8af',
              }"
              :shape="'square'"
              @search="
                async () => {
                  mV.uni.showLoading({
                    title: '加载中',
                  })
                  console.log(baseSearchParams)
                  const { data } = await getArticleList({
                    title: searchValue || undefined,
                    ...baseSearchParams,
                  })
                  articleList = data.articleList
                  mV.uni.hideLoading()
                }
              "
              @custom="
                async () => {
                  mV.uni.showLoading({
                    title: '加载中',
                  })
                  const { data } = await getArticleList({
                    title: searchValue || undefined,
                    ...baseSearchParams,
                  })
                  articleList = data.articleList
                  mV.uni.hideLoading()
                }
              "
              @clear="searchValue = undefined"
            />
            <ArticleItem
              v-for="item in articleList"
              :articleItem="item"
              :key="item.id"
              :customeStyle="
                seletedArticleId.includes(item.id)
                  ? 'background-color:#dff0ff;'
                  : ''
              "
              @longpress="
                () => {
                  if (userInfo.id !== userStore.id) return
                  seletedArticleId.push(item.id)
                  articleOperPopupConf.params.status = ArticleStatusEnum.Public
                  articleOperPopupConf.show = true
                }
              "
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
            <view class="text-15px p-[10px_0]">暂无文章</view>
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
  <up-popup
    :show="articleOperPopupConf.show"
    :duration="articleOperPopupConf.duration"
    :mode="'bottom'"
    :onClose="
      () => {
        seletedArticleId = []
        articleOperPopupConf.show = false
      }
    "
  >
    <view class="p-[15px_10px] bg-#f5f5f5">
      <view class="font-700 my-10px">设置</view>
      <view class="flex items-center">
        <view class="text-14px mr-10px">文章可见性</view>
        <up-radio-group v-model="articleOperPopupConf.params.status">
          <up-radio
            v-for="item in articleStatusList"
            :key="item.code"
            :name="item.code"
            :label="item.name"
            shape="circle"
            :icon-size="13"
            :label-size="15"
          />
        </up-radio-group>
      </view>
      <view
        class="mt-15px rounded-4px p-8px bg-#fff text-center text-14px"
        @click="
          async () => {
            await updateArticle({
              articleId: seletedArticleId[0],
              status: articleOperPopupConf.params.status,
            })
            articleList = articleList.filter(
              (item) =>
                item.id !== seletedArticleId[0] ||
                (item.id === seletedArticleId[0] &&
                  item.status === articleOperPopupConf.params.status)
            )
            articleOperPopupConf.show = false
            seletedArticleId = []
            mV.uni.showToast({
              title: '保存成功',
              icon: 'none',
              duration: 2000,
            })
          }
        "
      >
        保存设置
      </view>
    </view>
  </up-popup>
  <up-popup
    :show="operPopupConf.show"
    :duration="operPopupConf.duration"
    :mode="'bottom'"
    :onClose="() => (operPopupConf.show = false)"
  >
    <view class="p-[15px_10px] bg-#f5f5f5">
      <view
        v-for="(item, index) in operPopupConf.operationList"
        :key="item.label"
      >
        <view
          class="rounded-4px p-10px bg-#fff text-center"
          :style="{ color: item.color }"
          v-if="!item.hidden()"
          @click="item.clickAction"
        >
          {{ item.label }}
        </view>
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import ArticleItem from '@/components/ArticleItem.vue'
import router from '@/router'
import {
  blockUser,
  getArticleList,
  getUserInfo,
  unblockUser,
  updateArticle,
} from '@/service'
import type { GetArticleList, GetUserInfo } from '@/service/types/api'
import { ArticleStatusEnum } from '@/service/types/db.d'
import { useUserStore } from '@/stores'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, onMounted, reactive, ref, watch } from 'vue'

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

onShow(async () => {
  if (!userInfo.id) {
    return
  }
  const { data } = await getArticleList({
    ...baseSearchParams.value,
  })
  articleList.value = [...data.articleList]
})

const mV = {
  uni,
}
const positionInfo = reactive({
  safeTop: uni.getSystemInfoSync().safeArea?.top ?? 0,
  windowHeight: uni.getSystemInfoSync().windowHeight,
  navbarHeight: 44,
  tabarHeight: 0,
})
const userInfo = reactive<Partial<GetUserInfo.Response['data']>>({})
const userStore = useUserStore()
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

const navbarMode = ref<'light' | 'dark'>('dark')
const activeTab = ref('dynamics')
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
const activeArticleTab = ref<ArticleStatusEnum>(ArticleStatusEnum.Public)
const articleStatusList = [
  {
    code: ArticleStatusEnum.Public,
    name: '公开',
  },
  {
    code: ArticleStatusEnum.OnlyMe,
    name: '私密',
  },
  {
    code: ArticleStatusEnum.Draft,
    name: '草稿',
  },
]

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
const searchValue = ref<string | undefined>('')
const baseSearchParams = computed<GetArticleList.Request>(() => ({
  userId: userInfo.id,
  orderBy: [{ field: 'createTime', direction: 'DESC' }],
  limit: 6,
  status: activeArticleTab.value,
}))

watch(searchValue, async (newVal) => {
  if (newVal === '') {
    uni.showLoading({
      title: '加载中',
    })
    const { data } = await getArticleList({
      ...baseSearchParams.value,
    })
    articleList.value = data.articleList
    uni.hideLoading()
  }
})
watch(activeArticleTab, async (newVal) => {
  uni.showLoading({
    title: '加载中',
  })
  const { data } = await getArticleList({
    ...baseSearchParams.value,
  })
  articleList.value = data.articleList
  uni.hideLoading()
})

const seletedArticleId = ref<number[]>([])
const articleOperPopupConf = reactive({
  show: false,
  duration: 300,
  params: {
    status: 0,
  },
})

const operPopupConf = reactive({
  show: false,
  duration: 300,
  operationList: [
    {
      label: '解除拉黑',
      color: 'red',
      hidden: () => {
        return !userStore.blacklist?.includes(userInfo.id!)
      },
      clickAction: async () => {
        if (!userInfo.id) {
          return
        }
        await unblockUser({
          blockedUserId: userInfo.id,
        })
        userStore.blacklist = userStore.blacklist?.filter(
          (item) => item !== userInfo.id
        )
        operPopupConf.show = false
        uni.showToast({
          title: '解除拉黑成功',
          icon: 'none',
        })
      },
    },
    {
      label: '拉黑',
      color: 'red',
      hidden: () => {
        return userStore.blacklist?.includes(userInfo.id!)
      },
      clickAction: async () => {
        if (!userInfo.id) {
          return
        }
        await blockUser({
          blockedUserId: userInfo.id,
        })
        userStore.blacklist?.push(userInfo.id)
        operPopupConf.show = false
        uni.showToast({
          title: '拉黑成功',
          icon: 'none',
        })
      },
    },
  ],
})
</script>
