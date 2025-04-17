<template>
  <view class="grid grid-rows-[auto_1fr_auto] h-100vh">
    <up-navbar :title="'写文章'" placeholder auto-back />
    <view class="grid grid-rows-[auto_1fr_auto] p-[0_15px] overflow-auto">
      <textarea
        class="w-full my-10px py-5px font-700 text-18px b-b b-b-solid b-b-#dadbde"
        placeholder="请输入标题"
        placeholderStyle="color: #c0c4cc"
        placeholderClass="font-normal"
        v-model="articleInfo.title"
        autoHeight
      />
      <SvEditor
        class="text-15px"
        pasteMode="origin"
        placeholder="请输入正文"
        @ready="ready"
        @input="({ text = '', html = '' }) => (articleInfo.content = html)"
      />
      <view class="p-[10px_0px] pos-sticky pos-bottom-0 bg-white">
        <view class="flex items-center gap-col-8px">
          <view class="text-14px text-#A9A9A9">选择文章类型</view>
          <view class="flex items-end flex-wrap gap-col-8px">
            <up-tag
              v-if="articleInfo.articleCategoryId"
              :text="
                articleCatygoryPicker.list[0]?.find(
                  (item) => item.id === articleInfo.articleCategoryId
                )?.name
              "
              :size="'medium'"
              plain
              closable
              @close="articleInfo.articleCategoryId = undefined"
            />
            <up-tag
              text="选择"
              :size="'medium'"
              :color="'#A9A9A9'"
              :borderColor="'#CCC'"
              plain
              @click="articleCatygoryPicker.show = true"
            />
            <up-picker
              :show="articleCatygoryPicker.show"
              :columns="articleCatygoryPicker.list"
              keyName="name"
              closeOnClickOverlay
              @cancel="articleCatygoryPicker.show = false"
              @close="articleCatygoryPicker.show = false"
              @confirm="
                (item: any) => {
                  articleInfo.articleCategoryId = item.value[0].id
                  articleCatygoryPicker.show = false
                }
              "
            />
          </view>
        </view>
      </view>
    </view>
    <SvEditorToolbar
      ref="toolbarRef"
      :tools="['style', 'emoji', 'more']"
      :moreTools="['image', 'link']"
      :toolbarStyle="{ flex: 'none', width: 'auto' }"
      :toolbarItemStyle="{ flex: 'none', width: '80rpx' }"
      :activeToolStyle="{ color: 'var(--primary-color)' }"
      @moreItemConfirm="moreItemConfirm"
    >
      <template #toolbarRight>
        <view class="flex gap-10px mr-10px">
          <up-button
            :size="'small'"
            :disabled="!articleInfo.title || !articleInfo.content"
            :type="'warning'"
            @click="saveAsDraft"
          >
            保存为草稿
          </up-button>
          <up-button
            :size="'small'"
            type="primary"
            :disabled="!articleInfo.title || !articleInfo.content"
            @click="onPublishArticle"
          >
            发布
          </up-button>
        </view>
      </template>
    </SvEditorToolbar>
  </view>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import SvEditor from '@/plugins/sv-editor/components/sv-editor/sv-editor.vue'
import SvEditorToolbar from '@/plugins/sv-editor/components/sv-editor/sv-editor-toolbar.vue'
import {
  addAt,
  addTopic,
  addAttachment,
  addImage,
  addLink,
  addVideo,
} from '@/plugins/sv-editor/components/common/utils'
import {
  getArticleCategoryList,
  publishArticle,
  updateArticle,
} from '@/service'
import { uploadFile } from '@/api/http'
import router from '@/router'
import { onLoad } from '@dcloudio/uni-app'
import { ArticleStatusEnum } from '@/service/types/db.d'
import type { GetArticleCategories } from '@/service/types/api'

onLoad(async (options) => {
  if (options?.editedArticleId) {
    articleInfo.articleId = Number(options.editedArticleId)
    articleInfo.title = options?.title
    articleInfo.content = options?.content
    articleInfo.articleCategoryId = +options?.categoryId || undefined
  }
})

onMounted(async () => {
  const { data } = await getArticleCategoryList()
  articleCatygoryPicker.list = [data]
})

const editorCtx = ref<any>(null)
const toolbarRef = ref<any>(null)

const articleInfo = reactive({
  articleId: undefined as number | undefined,
  title: '',
  content: '',
  articleCategoryId: undefined as number | undefined,
})

const ready = (e: any) => {
  editorCtx.value = e
  editorCtx.value.setContents({
    html: articleInfo.content,
  })
}

/** 中间变量 */
const mV = {
  uni,
  setTimeout,
}

const moreItemConfirm = async (e: any) => {
  const file = e.file
  // 添加图片
  if (e.name == 'image') {
    const imageRes = await addImage(
      async () => {
        uni.showLoading({ title: '上传中' })
        const { success } = await uploadFile(
          'articleImg',
          file.map((item: any) => ({
            name: 'file',
            filePath: item.tempFilePath,
          }))
        )
        uni.hideLoading()
        return success.map((item) => ({ path: item.url }))
      },
      { srcFiled: 'path' }
    )
    if (imageRes) {
      uni.showToast({ title: '添加图片成功', icon: 'success' })
    } else {
      uni.showToast({ title: '添加图片失败', icon: 'error' })
    }
  }

  // 添加链接
  if (e.name == 'link') {
    addLink({ link: e.link, text: e.text }, () => {
      uni.showToast({ title: '添加链接成功' })
    })
  }
  // 关闭弹窗
  toolbarRef.value.closeMorePop()
}

const onPublishArticle = async () => {
  const articleStatus = await new Promise<ArticleStatusEnum>(
    (resolve, reject) => {
      uni.showModal({
        content: '是否仅自己可见',
        success: (res) => {
          resolve(
            res.confirm ? ArticleStatusEnum.OnlyMe : ArticleStatusEnum.Public
          )
        },
        fail: (err) => {
          reject(err)
        },
      })
    }
  )
  const { data } = articleInfo.articleId
    ? await updateArticle({ ...articleInfo, status: articleStatus } as any)
    : await publishArticle({ ...articleInfo, status: articleStatus })
  const articleId = articleInfo.articleId ?? data.id
  await uni.showToast({
    title: '发布成功',
    icon: 'none',
  })
  setTimeout(() => {
    router.replace({
      name: 'articleDetail',
      params: { articleId: String(articleId) },
    })
  }, 1000)
}

/** 保存文章为草稿 */
const saveAsDraft = async () => {
  const { data } = await publishArticle({
    ...articleInfo,
    status: ArticleStatusEnum.Draft,
  })
  await uni.showToast({
    title: '保存成功',
    icon: 'none',
  })
  setTimeout(() => {
    router.replace({
      name: 'articleDetail',
      params: { articleId: String(data.id) },
    })
  }, 1000)
}

const articleCatygoryPicker = reactive({
  show: false,
  list: [] as GetArticleCategories.Response['data'][],
})
</script>
