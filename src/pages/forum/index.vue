<template>
  <view>
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
import type { GetArticleList } from '@/service/types/api'
import { onMounted, ref, watch } from 'vue'

const searchValue = ref<string | undefined>('')
const articleList = ref<GetArticleList.Response['data']['articleList']>([])

onMounted(async () => {
  await searchAction()
})

watch(searchValue, async (newVal) => {
  newVal === '' && (await searchAction())
})

const searchAction = async () => {
  const { data } = await getArticleList({
    orderBy: [
      { field: 'createTime', direction: 'DESC' },
      {
        field: 'likeCount',
        direction: 'DESC',
      },
      {
        field: 'collectionCount',
        direction: 'DESC',
      },
    ],
    title: searchValue.value || undefined,
  })
  articleList.value = data.articleList
}
</script>
