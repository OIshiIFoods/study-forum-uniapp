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
          categoryId: activeArticleCatygory || undefined,
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
          categoryId: activeArticleCatygory || undefined,
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
              categoryId: activeArticleCatygory || undefined,
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
              categoryId: activeArticleCatygory || undefined,
              ...baseSearchParams,
            })
            articleList = data.articleList
            mV.uni.hideLoading()
          }
        "
        @clear="searchValue = undefined"
      />
      <up-scroll-list :indicator="false" indicatorStyle="">
        <view
          v-for="(item, index) in articleCatygoryList"
          class="text-#CCC text-13px p-[8px_10px]"
          :class="activeArticleCatygory === item.id ? 'text-black' : ''"
          :key="index"
          @click="
            () => {
              activeArticleCatygory = item.id
            }
          "
        >
          {{ item.name }}
        </view>
      </up-scroll-list>
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
import { getArticleCategoryList, getArticleList } from '@/service'
import type { GetArticleCategories, GetArticleList } from '@/service/types/api'
import { ArticleStatusEnum } from '@/service/types/db.d'
import { onMounted, reactive, ref, watch } from 'vue'

const searchValue = ref<string | undefined>('')
const activeArticleCatygory = ref<number>(0)
const articleList = ref<GetArticleList.Response['data']['articleList']>([])
const articleCatygoryList = reactive<GetArticleCategories.Response['data']>([
  {
    id: 0,
    name: '全部',
    description: '全部',
    createdTime: '',
    updatedTime: '',
    deletedTime: '',
  },
])
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
  status: ArticleStatusEnum.Public,
}

onMounted(async () => {
  uni.showLoading({
    title: '加载中',
  })
  const { data } = await getArticleList({
    categoryId: activeArticleCatygory.value || undefined,
    ...baseSearchParams,
  })
  articleList.value = data.articleList
  const { data: articleCatData } = await getArticleCategoryList()
  articleCatygoryList.push(...articleCatData)
  uni.hideLoading()
})

watch(searchValue, async (newVal) => {
  if (newVal === '') {
    uni.showLoading({
      title: '加载中',
    })
    const { data } = await getArticleList({
      categoryId: activeArticleCatygory.value || undefined,
      ...baseSearchParams,
    })
    articleList.value = data.articleList
    uni.hideLoading()
  }
})

watch(activeArticleCatygory, async () => {
  uni.showLoading({
    title: '加载中',
  })
  const { data: articleData } = await getArticleList({
    ...baseSearchParams,
    categoryId: activeArticleCatygory.value || undefined,
  })
  articleList.value = articleData.articleList
  uni.hideLoading()
})
</script>
