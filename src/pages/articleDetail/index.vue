<template>
  <view class="grid grid-rows-[auto_1fr_auto] h-100vh">
    <up-navbar :fixed="false" auto-back>
      <template #center>
        <view class="flex items-center justify-between">
          <view>
            <up-avatar
              class="mx-[10px]"
              :src="baseURL + '' + userInfo?.avatarLink"
              :size="40"
            />
            <view class="text-[#333] text-[16px]">
              {{ userInfo?.nickname }}
            </view>
          </view>
          <up-button type="error" size="small" :shape="'circle'">
            关注
          </up-button>
        </view>
      </template>
    </up-navbar>
    <view class="px-10px">
      <view class="text-[#333] text-[20px] font-700 b-b b-b-solid b-b-#eee">
        {{ articleInfo?.title }}
      </view>
      <view class="py-10px b-b b-b-solid b-b-#eee">
        <up-parse :content="articleInfo?.content" />
        <view class="text-[#999] text-[14px] my-8px">
          {{ dayjs(articleInfo?.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import { getArticleDetailInfo } from '@/service'
import { GetArticleDetailInfo } from '@/service/types/api'
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { ref } from 'vue'

type OnloadParamType =
  | {
      articleId: string
    }
  | undefined

onLoad(async (param) => {
  const params = param as OnloadParamType
  if (!params?.articleId) {
    uni.showToast({
      title: '文章不存在',
      icon: 'none',
    })
    return
  }
  const { data: articleData } = await getArticleDetailInfo({
    articleId: Number(params.articleId),
  })
  userInfo.value = articleData.userInfo
  articleInfo.value = articleData.articleInfo
  commentList.value = articleData.commentList
})

const userInfo = ref<GetArticleDetailInfo.Response['data']['userInfo']>()
const articleInfo = ref<GetArticleDetailInfo.Response['data']['articleInfo']>()
const commentList = ref<GetArticleDetailInfo.Response['data']['commentList']>()
</script>

<style scoped></style>
