<template>
  <view
    class="bg-[var(--bg-primary-color)] h-100vh grid grid-rows-[auto_auto_1fr]"
  >
    <up-navbar
      title="研友坛"
      leftIcon=""
      :autoBack="false"
      :bgColor="'rgba(0,0,0,0)'"
      placeholder
    />
    <up-swiper :list="swiperList" />
    <view class="bg-white overflow-auto rounded-20px box-border p-10px mt-15px">
      <view class="my-15px font-600">最新资讯</view>
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
        @search="searchAction"
        @custom="searchAction"
        @clear="searchValue = undefined"
      />
      <ArticleItem
        v-for="item in articleList"
        :articleItem="item"
        :key="item.id"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import ArticleItem from '@/components/ArticleItem.vue'
import { getArticleList } from '@/service'
import { getSwiperList } from '@/service/modules/common'
import type { GetArticleList } from '@/service/types/api'
import { onMounted, ref, watch } from 'vue'

const swiperList = ref<{ id: number; url: string }[]>([])
const searchValue = ref<string | undefined>('')
const articleList = ref<GetArticleList.Response['data']['articleList']>([])
const officialUSERID = +(process.env.Official_USER_ID ?? 0)

onMounted(async () => {
  swiperList.value = await getSwiperList()
  await searchAction()
})

watch(searchValue, async (newVal) => {
  newVal === '' && (await searchAction())
})

const searchAction = async () => {
  const { data } = await getArticleList({
    userId: officialUSERID,
    orderBy: [{ field: 'createTime', direction: 'DESC' }],
    title: searchValue.value || undefined,
  })
  articleList.value = data.articleList
}
</script>

<style></style>
