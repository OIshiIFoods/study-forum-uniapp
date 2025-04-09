<template>
  <view
    class="p-10px m-5px rounded-8px bg-[white]"
    :class="props.customeClass"
    :style="props.customeStyle"
    @click="
      router.push({
        name: 'articleDetail',
        params: { articleId: String(articleItem.id) },
      })
    "
    @longpress="() => definedEmit('longpress')"
  >
    <up-text :lines="1" :text="articleItem.title" bold />
    <view class="flex items-center my-8px gap-col-5px">
      <up-avatar :src="baseURL + '' + articleItem.avatarLink" :size="20" />
      <up-text :text="articleItem.nickname" :size="13" />
    </view>
    <up-text
      :lines="2"
      :text="parseHtmlString(articleItem.content)"
      :size="13"
    />
    <view class="flex justify-between mt-10px text-#949494">
      <view class="flex" v-for="item in statusList" :key="item.title">
        <up-icon :name="item.iconname" />
        <view class="ml-3px text-13px">{{ item.value }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import router from '@/router'
import type { GetArticleList } from '@/service/types/api'
import { parseHtmlString } from '@/utils'
import { computed } from 'vue'

type ArticleItemProps = GetArticleList.Response['data']['articleList'][0]

const props = defineProps<{
  articleItem: ArticleItemProps
  customeClass?: any
  customeStyle?: any
}>()
const definedEmit = defineEmits(['longpress'])

const statusList = computed(() => [
  {
    title: '浏览',
    value: props.articleItem.viewCount,
    iconname: 'eye',
  },
  {
    title: '评论',
    value: props.articleItem.commentCount,
    iconname: 'chat',
  },
  {
    title: '点赞',
    value: props.articleItem.likeCount,
    iconname: 'thumb-up',
  },
  {
    title: '收藏',
    value: props.articleItem.collectionCount,
    iconname: 'star',
  },
])
</script>

<style scoped></style>
