<template>
  <view
    class="p-10px m-5px rounded-8px bg-[white]"
    :class="props.customeClass"
    :style="props.customeStyle"
    @click="
      async () => {
        const reportRes = await getReportReordCount({
          targetId: articleItem.id,
          targetType: ReportTargetType.Article,
        })
        // 非本人创建的文章
        if (articleItem.userId !== userStore.id) {
          if (reportRes.data.count >= 20) {
            mV.uni.showModal({
              title: '无法访问',
              content: '当前文章已被多次举报，无法访问！',
            })
          } else if (reportRes.data.count >= 5) {
            mV.uni.showModal({
              title: '是否继续访问',
              content:
                '当前文章已被多次举报，若继续访问，请认真辨别里面的内容！',
              success(res) {
                if (res.confirm) {
                  router.push({
                    name: 'articleDetail',
                    params: { articleId: String(articleItem.id) },
                  })
                }
              },
            })
          } else {
            router.push({
              name: 'articleDetail',
              params: { articleId: String(articleItem.id) },
            })
          }
        } else {
          if (reportRes.data.count >= 10) {
            mV.uni.showModal({
              title: '文章已被多次举报',
              content: '当前文章已被多次举报，请仔细审查文章内容！',
              success(res) {
                if (res.confirm) {
                  router.push({
                    name: 'articleDetail',
                    params: { articleId: String(articleItem.id) },
                  })
                }
              },
              showCancel: false,
            })
          }
        }
      }
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
import { getReportReordCount } from '@/service'
import type { GetArticleList } from '@/service/types/api'
import { ReportTargetType } from '@/service/types/db.d'
import { useUserStore } from '@/stores'
import { parseHtmlString } from '@/utils'
import { computed } from 'vue'

type ArticleItemProps = GetArticleList.Response['data']['articleList'][0]

const props = defineProps<{
  articleItem: ArticleItemProps
  customeClass?: any
  customeStyle?: any
}>()
const definedEmit = defineEmits(['longpress'])

const mV = {
  uni,
}
const userStore = useUserStore()
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
