<template>
  <view>
    <up-navbar auto-back placeholder>
      <template #center>
        <up-tabs
          :list="tabbarItemList"
          :duration="200"
          lineHeight="2"
          lineWidth="45"
          lineColor="var(--primary-color)"
          :activeStyle="{
            color: 'var(--primary-color)',
            fontWeight: 700,
          }"
          itemStyle="flex:1; fontSize:10px; padding:3px 15px 10px; color:#878787;"
          :onChange="(item: any) => (activeTab = item.code)"
        />
      </template>
    </up-navbar>
    <view class="bg-white rounded-20px box-border p-10px">
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
import { getArticleList } from '@/service'
import type { GetArticleList } from '@/service/types/api'
import { useUserStore } from '@/stores'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref, watch } from 'vue'
import ArticleItem from '@/components/ArticleItem.vue'

// type OnLoadOptionsType = {
//   articleType?: string
// }

// onLoad(async (options) => {
//   const params = options as OnLoadOptionsType
//   activeTab.value = params.articleType ?? 'like'
// })
const tabbarItemList = [
  {
    code: 'like',
    name: '点赞',
  },
  {
    code: 'collect',
    name: '收藏',
  },
  {
    code: 'release',
    name: '发布',
  },
]
const activeTab = ref<string | undefined>(tabbarItemList[0].code)
const searchValue = ref<string | undefined>('')
const articleList = ref<GetArticleList.Response['data']['articleList']>([])
const userStore = useUserStore()

onShow(async () => {
  await searchAction()
})

watch(searchValue, async (newVal) => {
  newVal === '' && (await searchAction())
})

watch(activeTab, async (newVal) => {
  searchValue.value = ''
  await searchAction()
})

const searchAction = async () => {
  const params: Record<string, any> = {}
  if (activeTab.value === 'like') {
    params.isLiked = 1
  } else if (activeTab.value === 'collect') {
    params.isCollected = 1
  }
  const { data } = await getArticleList({
    userId: userStore.id,
    orderBy: [{ field: 'createTime', direction: 'DESC' }],
    title: searchValue.value || undefined,
    ...params,
  })
  articleList.value = data.articleList
}
</script>
