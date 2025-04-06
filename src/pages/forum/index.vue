<template>
  <scroll-view
    class="bg-[var(--bg-primary-color)]"
    style="height: 100vh"
    scroll-y
    scrollWithAnimation
    :scroll-top="scrollViewRelatedProps.scrollTop"
    @scroll="(e) => (scrollViewRelatedProps.old.scrollTop = e.detail.scrollTop)"
    @scrolltolower="
      async () => {
        if (scrollViewRelatedProps.isLower) return
        scrollViewRelatedProps.isLower = true
        await searchAction()
        scrollViewRelatedProps.isLower = false
      }
    "
  >
    <up-navbar title="论坛" leftIcon="" :autoBack="false" placeholder />
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
            articleList = []
            await searchAction()
          }
        "
        @custom="
          async () => {
            articleList = []
            await searchAction()
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
import { onShow } from '@dcloudio/uni-app'
import { ref, watch } from 'vue'

const searchValue = ref<string | undefined>('')
const articleList = ref<GetArticleList.Response['data']['articleList']>([])
const scrollViewRelatedProps = ref({
  /** 滚动区域滚动条位置 */
  scrollTop: 0,
  /** 是否触底 */
  isLower: false,
  /** 旧数据 */
  old: {
    scrollTop: 0,
  },
})

onShow(async () => {
  await searchAction()
})

watch(searchValue, async (newVal) => {
  if (newVal === '') {
    articleList.value = []
    await searchAction()
  }
})

const searchAction = async () => {
  const { data } = await getArticleList({
    orderBy: [{ field: 'createTime', direction: 'DESC' }],
    title: searchValue.value || undefined,
    createTime: ['', articleList.value.at(-1)?.createTime ?? ''],
    limit: 6,
  })
  articleList.value.push(...data.articleList)
}
</script>
