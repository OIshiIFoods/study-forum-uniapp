<template>
  <up-navbar title="论坛" leftIcon="" :autoBack="false" placeholder />
  <scroll-view
    class="bg-[var(--bg-primary-color)]"
    style="height: 100vh"
    refresherEnabled
    :refresherTriggered="scrollViewRelatedProps.refresherTriggered"
    @refresherrefresh="
      async () => {
        scrollViewRelatedProps.refresherTriggered = true
        mV.uni.showLoading({
          title: '加载中',
        })
        searchValue = ''
        const { data } = await getArticleList({
          ...baseSearchParams,
        })
        articleList = data.articleList
        mV.uni.hideLoading()
        mV.uni.showToast({
          title: '更新成功',
          icon: 'none',
        })
        scrollViewRelatedProps.refresherTriggered = false
      }
    "
    :refresherThreshold="30"
    scroll-y
    scrollWithAnimation
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
    <view class="bg-white box-border p-10px">
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
      />
      <up-loadmore
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
import type { GetArticleList } from '@/service/types/api'
import { onMounted, ref, watch } from 'vue'

const searchValue = ref<string | undefined>('')
const articleList = ref<GetArticleList.Response['data']['articleList']>([])
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
const mV = {
  uni,
}
const baseSearchParams: GetArticleList.Request = {
  orderBy: [{ field: 'createTime', direction: 'DESC' }],
  limit: 6,
}

onMounted(async () => {
  uni.showLoading({
    title: '加载中',
  })
  const { data } = await getArticleList({
    ...baseSearchParams,
  })
  articleList.value = data.articleList
  uni.hideLoading()
})

watch(searchValue, async (newVal) => {
  if (newVal === '') {
    uni.showLoading({
      title: '加载中',
    })
    const { data } = await getArticleList({
      ...baseSearchParams,
    })
    articleList.value = data.articleList
    uni.hideLoading()
  }
})
</script>
