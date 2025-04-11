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
          categoryId: activeArticleCatygory || undefined,
          ...baseSearchParams,
        })
        articleList.push(...data.articleList)
        scrollViewRelatedProps.isLower = false
      }
    "
  >
    <up-swiper
      :list="swiperList"
      @click="
        (index) => {
          console.log(index, swiperList[index].articleId)
          if (swiperList[index].articleId) {
            router.push({
              name: 'articleDetail',
              params: {
                articleId: String(swiperList[index].articleId),
              },
            })
          }
        }
      "
    />
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
      </view>
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
import router from '@/router'
import { getArticleCategoryList, getArticleList } from '@/service'
import { getSwiperList } from '@/service/modules/common'
import type { GetArticleCategories, GetArticleList } from '@/service/types/api'
import { ArticleStatusEnum } from '@/service/types/db.d'
import { nextTick, onMounted, reactive, ref, watch } from 'vue'

const swiperList = ref<{ id: number; url: string; articleId?: number }[]>([])
const searchValue = ref<string | undefined>('')
const activeArticleCatygory = ref<number>(0)
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
  status: ArticleStatusEnum.Public,
}

const mV = {
  uni,
}

onMounted(async () => {
  await initalData()
})

watch(searchValue, async (newVal) => {
  if (newVal === '') {
    uni.showLoading({
      title: '加载中',
    })
    const { data } = await getArticleList({
      ...baseSearchParams,
      categoryId: activeArticleCatygory.value || undefined,
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

const initalData = async () => {
  uni.showLoading({
    title: '加载中',
  })
  searchValue.value = ''
  swiperList.value = await getSwiperList()
  const { data: articleData } = await getArticleList({
    ...baseSearchParams,
    categoryId: activeArticleCatygory.value || undefined,
  })
  articleList.value = articleData.articleList
  const { data: articleCatData } = await getArticleCategoryList()
  articleCatygoryList.push(...articleCatData)
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
