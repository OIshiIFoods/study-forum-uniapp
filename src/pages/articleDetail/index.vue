<template>
  <view
    v-if="
      !(
        userInfo?.userId !== userStore.id &&
        articleInfo?.status !== ArticleStatusEnum.Public
      )
    "
  >
    <scroll-view
      class="px-10px h-100vh box-border"
      scroll-y
      @scrolltolower="
        async () => {
          if (scrollViewRelatedProps.isLower) return
          scrollViewRelatedProps.isLower = true
          const lastComment = commentData.commentList
            .filter((item) => !item.parentId)
            .sort((a: any, b: any) => {
              return +new Date(b.createTime) - +new Date(a.createTime)
            })
            .at(-1)
          const { data: commentInfos } = await getArticleCommentList({
            articleId: articleInfo?.id,
            parentCommentId: -1,
            createTime: ['', lastComment?.createTime ?? ''],
            orderBy: [{ field: 'createTime', direction: 'DESC' }],
            limit: 5,
          })
          commentData.commentList.push(
            ...commentInfos.commentList.map(formatCommentItem)
          )
          scrollViewRelatedProps.isLower = false
        }
      "
    >
      <up-navbar :title="'坛友动态'" placeholder>
        <template #left>
          <view
            class="flex items-center justify-between b-0.5px b-solid b-#efeff1 rounded-100px p-[3px_7px] opacity-80"
          >
            <up-icon
              v-if="!isFirstPage"
              name="arrow-left"
              size="19"
              @click="router.back()"
            />
            <up-line
              v-if="!isFirstPage"
              direction="col"
              :hairline="false"
              length="16"
              margin="0 8px"
            />
            <up-icon
              name="home"
              size="20"
              @click="router.pushTab({ name: 'index' })"
            />
          </view>
        </template>
      </up-navbar>
      <view class="flex items-center justify-between">
        <view class="flex items-center">
          <up-avatar
            class="mx-[10px]"
            :src="baseURL + '' + userInfo?.avatarLink"
            :size="40"
            @click="
              () => {
                clickAvatar({ userId: userInfo!.userId })
              }
            "
          />
          <view class="text-[#333] text-[16px]">
            {{ userInfo?.nickname }}
          </view>
        </view>
        <up-button
          v-if="userInfo?.userId !== userStore.id"
          :custom-style="{
            borderColor: 'var(--primary-color)',
            width: 'auto',
            margin: '0',
          }"
          :color="'var(--primary-color)'"
          :size="'small'"
          :shape="'circle'"
          :icon="isFollow ? 'checkmark' : ''"
          :iconColor="'white'"
          :text="isFollow ? '已关注' : '关注'"
          @click="
            async () => {
              const hasFollow = isFollow
              await followUser({
                followedUserId: userInfo!.userId,
                isFollow: !hasFollow,
              })
              await userStore.syncUserInfo()
              mV.uni.showToast({
                title: hasFollow ? '取消关注成功' : '关注成功',
                icon: 'none',
              })
            }
          "
        />
      </view>
      <view class="mt-15px">
        <view class="text-[#333] text-[20px] font-700">
          {{ articleInfo?.title }}
        </view>
        <up-line />
        <view class="mt-10px">
          <up-parse :content="articleInfo?.content" />
        </view>
        <view class="my-15px text-[#999] text-[12px]">
          {{ dayjs(articleInfo?.updateTime).format('YYYY-MM-DD') }}
        </view>
        <up-line />
      </view>
      <CommentSection
        ref="commentSecRef"
        v-model:comment-data="commentData"
        :onLike="likeComment"
        :onDelete="delComment"
        :onAdd="addComment"
        :onAvatarClick="clickAvatar"
        :onLoadComment="loadComment"
      />
      <up-loadmore
        height="50"
        icon
        :status="scrollViewRelatedProps.isLower ? 'loading' : 'nomore'"
      />
    </scroll-view>
    <view
      class="flex sticky bottom-0 bg-white p-10px b-t b-t-solid b-t-#ebeced"
    >
      <input
        class="flex-1 bg-[rgba(224,224,224,.5)] p-[6px_12px] text-14px text-[rgb(216,216,216)] rounded-full"
        placeholder="说点什么"
        disabled
        @click="commentSecRef?.showCommentInputSection"
      />
      <view class="flex items-center gap-15px ml-20px">
        <up-icon
          :name="
            articleInfo?.collectedUsers.includes(userStore.id ?? 0)
              ? 'star-fill'
              : 'star'
          "
          :color="
            articleInfo?.collectedUsers.includes(userStore.id ?? 0)
              ? '#FFA500'
              : ''
          "
          :size="30"
          :label="articleInfo?.collectedUsers.length ?? 0"
          @click="
            async () => {
              if (!articleInfo?.id) {
                mV.uni.showToast({
                  title: '文章不存在',
                  icon: 'none',
                })
                return
              }
              const isCollected = articleInfo?.collectedUsers.includes(
                userStore.id ?? 0
              )
              await collectArticle({
                articleId: articleInfo?.id,
                isCollected: isCollected ? 0 : 1,
              })
              if (isCollected) {
                articleInfo.collectedUsers.splice(
                  articleInfo.collectedUsers.indexOf(userStore.id!),
                  1
                )
              } else {
                articleInfo.collectedUsers.push(userStore.id!)
              }
            }
          "
        />
        <up-icon
          :name="
            articleInfo?.likedUsers.includes(userStore.id ?? 0)
              ? 'thumb-up-fill'
              : 'thumb-up'
          "
          :color="
            articleInfo?.likedUsers.includes(userStore.id ?? 0) ? '#59a3f4' : ''
          "
          :size="30"
          :label="articleInfo?.likedUsers.length ?? 0"
          @click="
            async () => {
              if (!articleInfo?.id) {
                mV.uni.showToast({
                  title: '文章不存在',
                  icon: 'none',
                })
                return
              }
              const isLiked = articleInfo?.likedUsers.includes(
                userStore.id ?? 0
              )
              await likeArticle({
                articleId: articleInfo?.id,
                isLiked: isLiked ? 0 : 1,
              })
              if (isLiked) {
                articleInfo.likedUsers.splice(
                  articleInfo.likedUsers.indexOf(userStore.id!),
                  1
                )
              } else {
                articleInfo.likedUsers.push(userStore.id!)
              }
            }
          "
        />
        <view
          class="pos-relative"
          v-if="moreActions.find((item) => !item.hidden)"
        >
          <up-icon
            name="more-dot-fill"
            @click="showMoreOperation = !showMoreOperation"
          />
          <view
            class="pos-absolute pos-bottom-[200%] pos-right-50% flex flex-col justify-around items-center transition-all bg-white overflow-hidden shadow-2xl rounded-[4px] box-border"
            :class="[showMoreOperation ? 'h-103px p-8px' : 'h-0 p-0']"
          >
            <view
              class="relative"
              v-for="(item, index) in moreActions"
              :key="index"
              v-show="!item.hidden"
            >
              <up-icon
                class="whitespace-nowrap"
                :name="item.icon"
                :label="item.label"
                :color="item.color"
                :labelSize="16"
                @click="item.clickAction"
              />
              <button
                class="absolute pos-top-0 w-[100%] h-[100%] bg-[rgba(0,0,0,0)] after:b-0"
                v-if="item.name === 'share'"
                open-type="share"
              />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
  <ReportModal
    ref="reportModal"
    :target-id="articleInfo?.id ?? -1"
    :target-type="ReportTargetType.Article"
    @success="
      () => {
        showMoreOperation = false
        articleInfo && (articleInfo.hasReport = true)
      }
    "
  />
</template>

<script setup lang="ts">
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { computed, reactive, ref } from 'vue'
import { baseURL } from '@/api/http'
import { useUserStore } from '@/stores'
import {
  addArticleComment,
  collectArticle,
  deleteArticle,
  deleteArticleComment,
  followUser,
  getArticleCommentList,
  getArticleDetailInfo,
  likeArticle,
  likeArticleComment,
} from '@/service'
import type {
  GetArticleCommentList,
  GetArticleDetailInfo,
} from '@/service/types/api'
import CommentSection from '@/components/CommentSection/index.vue'
import type {
  CommentDataModelProps,
  CommentSectionRefType,
  OnAddCommentProps,
  OnClickAvatarProps,
  OnDeleteProps,
  OnLikeProps,
  OnLoadCommentProps,
} from '@/components/CommentSection/index.vue'
import router from '@/router'
import {
  ArticleStatusEnum,
  ReportTargetType,
  type ArticleCommentProps,
  type UserProps,
} from '@/service/types/db.d'
import ReportModal, { ReportRefType } from '@/components/ReportModal.vue'

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
  commentData.value = {
    userAvatarLink: baseURL + '' + userStore.avatarLink,
    commentCount: articleData.commentList.length,
    commentList: articleData.commentList.map(formatCommentItem),
  }
  if (
    userInfo.value?.userId !== userStore.id &&
    articleInfo.value.status !== ArticleStatusEnum.Public
  ) {
    uni.showToast({
      title: '无权限访问',
      icon: 'none',
    })
    setTimeout(() => {
      router.back()
    }, 2000)
    return
  }
})

onShareAppMessage(({ from, target }) => {
  if (from === 'button') {
    return {
      title: '文章分享',
      path: `/pages/articleDetail/index?${Object.entries({
        articleId: articleInfo.value?.id,
      })
        .map(([field, value]) => field + '=' + value)
        .join('&')}`,
      success(...arg) {
        console.log('arg', arg)
        uni.showToast({
          title: '分享成功',
          icon: 'none',
        })
      },
      fail(...arg) {
        console.log('arg', arg)
        uni.showToast({
          title: '分享失败',
          icon: 'none',
        })
      },
    }
  } else {
    return {}
  }
})
const isFirstPage = getCurrentPages().length === 1
const userStore = useUserStore()
const userInfo = ref<GetArticleDetailInfo.Response['data']['userInfo']>()
const articleInfo = ref<GetArticleDetailInfo.Response['data']['articleInfo']>()
const commentSecRef = ref<CommentSectionRefType>()
const commentData = ref<CommentDataModelProps>({
  userAvatarLink: '',
  commentCount: 0,
  commentList: [],
})
const isFollow = computed(() => {
  return userStore.followList?.find(
    (item) => item.userId === userInfo.value?.userId
  )
    ? true
    : false
})
const showMoreOperation = ref(false)
const reportModal = ref<ReportRefType>()
const moreActions = computed(() => [
  {
    hidden: userInfo.value?.userId !== userStore.id,
    name: 'edit',
    label: '编辑',
    icon: 'edit-pen',
    color: '#59a3f4',
    clickAction: () => {
      router.replace({
        name: 'publishArticle',
        params: {
          editedArticleId: String(articleInfo.value?.id),
          title: String(articleInfo.value?.title),
          content: String(articleInfo.value?.content),
          categoryId: String(articleInfo.value?.categoryId ?? ''),
        },
      })
    },
  },
  {
    hidden: userInfo.value?.userId !== userStore.id,
    name: 'delete',
    label: '删除',
    icon: 'trash',
    color: '#ff0000',
    clickAction: async () => {
      const confirmRes = await uni.showModal({
        content: '确定删除吗？',
      })
      if (!confirmRes.confirm) {
        return
      }
      await deleteArticle({
        articleIdList: [articleInfo.value!.id],
      })
      await uni.showToast({
        title: '删除成功',
        icon: 'none',
      })
      router.back()
    },
  },
  {
    hidden: false,
    name: 'share',
    label: '分享',
    icon: 'share',
    color: 'var(--primary-color)',
    clickAction: async () => {},
  },
  {
    hidden: userInfo.value?.userId === userStore.id,
    name: 'report',
    label: articleInfo.value?.hasReport ? '已举报' : '举报',
    icon: 'warning',
    color: '#f9ae3d',
    clickAction: async () => {
      if (!reportModal.value || (articleInfo.value?.hasReport ?? true)) {
        return
      }
      reportModal.value.reportPopup.show = true
    },
  },
])
const scrollViewRelatedProps = ref({
  /** 是否触底 */
  isLower: false,
})

const addComment = async ({
  conmentContent,
  toCommentId,
  toCommentParentId,
}: OnAddCommentProps) => {
  const { data } = await addArticleComment({
    articleId: articleInfo.value!.id,
    content: conmentContent,
    // 若回复一级评论，则parentCommentId为该评论id
    parentCommentId: toCommentParentId ?? toCommentId,
    toCommentId: toCommentId,
  })
  commentData.value.commentCount += 1
  commentData.value.commentList.push(formatCommentItem(data))
}

const delComment = async ({ commentId, affectCount }: OnDeleteProps) => {
  await deleteArticleComment({
    commentIdList: [commentId],
  })
  commentData.value.commentCount -= affectCount
}

const likeComment = async ({ commentId }: OnLikeProps) => {
  await likeArticleComment({
    commentId,
  })
}

const clickAvatar = async ({ userId }: OnClickAvatarProps) => {
  router.push({
    name: 'userSpace',
    params: { userId: String(userId) },
  })
}

const loadComment = async ({ comment }: OnLoadCommentProps) => {
  const { data: commentInfos } = await getArticleCommentList({
    articleId: articleInfo.value!.id,
    parentCommentId: comment.id,
    createTime: [comment.children?.at(-1)?.createTime ?? '', ''],
    orderBy: [{ field: 'createTime', direction: 'ASC' }],
    limit: 3,
  })
  commentData.value.commentList.push(
    ...commentInfos.commentList.map(formatCommentItem)
  )
}

const formatCommentItem = (
  commentInfo: ArticleCommentProps & Pick<UserProps, 'nickname' | 'avatarLink'>
) => {
  const { parentCommentId, ...item } = commentInfo
  return {
    ...item,
    parentId: parentCommentId ?? undefined,
    createTime: dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
    avatarLink: baseURL + item.avatarLink,
    owner: item.userId === userStore.id,
    hasLike: JSON.parse(item.likedUserList)?.includes(userStore.id),
    likeCount: JSON.parse(item.likedUserList)?.length,
    isAuthor: item.userId === userInfo.value?.userId,
  }
}

const mV = {
  uni,
}
</script>
