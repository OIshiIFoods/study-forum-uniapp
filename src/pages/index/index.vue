<template>
  <up-navbar
    title="研友坛"
    leftIcon=""
    :autoBack="false"
    :bgColor="'var(--bg-primary-color)'"
    placeholder
  />
  <scroll-view
    class="bg-[var(--bg-primary-color)]"
    style="height: 100vh"
    scroll-y
    scrollWithAnimation
    refresherEnabled
    :refresherTriggered="scrollViewRelatedProps.refresherTriggered"
    @refresherrefresh="
      async () => {
        scrollViewRelatedProps.refresherTriggered = true
        await initalData()
        mV.uni.showToast({
          title: '更新成功',
          icon: 'none',
        })
        scrollViewRelatedProps.refresherTriggered = false
      }
    "
    :refresherThreshold="30"
    :scroll-top="scrollViewRelatedProps.scrollTop"
    @scroll="(e) => (scrollViewRelatedProps.old.scrollTop = e.detail.scrollTop)"
    @scrolltolower="
      async () => {
        if (scrollViewRelatedProps.isLower) return
        scrollViewRelatedProps.isLower = true
        const { data } = await getArticleList({
          title: searchValue || undefined,
          createTime: ['', articleList.at(-1)?.createTime ?? ''],
          ...baseSearchParams,
        })
        articleList.push(...data.articleList)
        scrollViewRelatedProps.isLower = false
      }
    "
  >
    <up-swiper :list="swiperList" />
    <view id="content" class="bg-white rounded-20px box-border p-10px mt-15px">
      <view class="my-15px font-600">最新资讯</view>
      <view
        @click="
          () => {
            scrollViewRelatedProps.scrollTop =
              scrollViewRelatedProps.old.scrollTop
            nextTick(() => {
              scrollViewRelatedProps.scrollTop = 150
            })
          }
        "
      >
        <up-search
          placeholder="搜索资讯"
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
      </view>
      <ArticleItem
        v-for="item in articleList"
        :articleItem="item"
        :key="item.id"
      />
      <up-loadmore
        v-if="articleList.length > 0"
        height="50"
        icon
        :status="scrollViewRelatedProps.isLower ? 'loading' : 'nomore'"
      />
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import ArticleItem from '@/components/ArticleItem.vue'
import { getArticleList } from '@/service'
import { getSwiperList } from '@/service/modules/common'
import type { GetArticleList } from '@/service/types/api'
import { nextTick, onMounted, ref, watch } from 'vue'

const swiperList = ref<{ id: number; url: string }[]>([])
const searchValue = ref<string | undefined>('')
const articleList = ref<GetArticleList.Response['data']['articleList']>([])
const officialUSERID = +(process.env.Official_USER_ID ?? 0)
const scrollViewRelatedProps = ref({
  /** 滚动区域滚动条位置 */
  scrollTop: 0,
  /** 是否触底 */
  isLower: false,
  /** 设置当前下拉刷新状态 */
  refresherTriggered: false,
  /** 旧数据 */
  old: {
    scrollTop: 0,
  },
})
const baseSearchParams: GetArticleList.Request = {
  userId: officialUSERID,
  orderBy: [{ field: 'createTime', direction: 'DESC' }],
  limit: 6,
}

const mV = {
  uni,
}

onMounted(async () => {
  await initalData()
})

watch(searchValue, async (newVal) => {
  if (newVal === '') {
    await initalData()
  }
})

const initalData = async () => {
  uni.showLoading({
    title: '加载中',
  })
  searchValue.value = ''
  swiperList.value = await getSwiperList()
  const { data } = await getArticleList({
    ...baseSearchParams,
  })
  articleList.value = data.articleList
  uni.hideLoading()
}

// const scrollToTargetPos = (cssSelector: string, pos: 'top' = 'top') => {
//   uni
//     .createSelectorQuery()
//     .select(cssSelector)
//     .boundingClientRect((res) => {
//       const nodeInfo = Array.isArray(res) ? res[0] : res
//       uni.pageScrollTo(
//         {
//           top: {
//             duration: 200, // 过渡时间
//             scrollTop: nodeInfo.top! - 64, // 滚动的实际距离
//           },
//         }[pos]
//       )
//     })
//     .exec()
// }
</script>

<style></style>
