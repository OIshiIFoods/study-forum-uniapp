<template>
  <view class="grid grid-rows-[auto_1fr_auto] h-100vh">
    <up-navbar :title="'写文章'" placeholder auto-back />
    <view class="grid grid-rows-[auto_1fr] p-[0_15px] overflow-auto">
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
        <view class="mr-10px">
          <up-button
            :size="'small'"
            type="primary"
            :disabled="!articleInfo.title || !articleInfo.content"
            @click="
              async () => {
                if (!articleInfo.title || !articleInfo.content) {
                  await mV.uni.showToast({
                    title: '请填写标题和内容',
                    icon: 'none',
                  })
                  return
                }
                const { data } = articleInfo.articleId
                  ? await updateArticle(articleInfo as any)
                  : await publishArticle(articleInfo)
                const articleId = articleInfo.articleId ?? data.id
                await mV.uni.showToast({
                  title: '发布成功',
                  icon: 'none',
                })
                mV.setTimeout(() => {
                  router.replace({
                    name: 'articleDetail',
                    params: { articleId: String(articleId) },
                  })
                }, 1000)
              }
            "
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
import { publishArticle, updateArticle } from '@/service'
import { uploadFile } from '@/api/http'
import router from '@/router'
import { onLoad } from '@dcloudio/uni-app'

onLoad(async (options) => {
  if (options?.editedArticleId) {
    articleInfo.articleId = Number(options.editedArticleId)
    articleInfo.title = options?.title
    articleInfo.content = options?.content
  }
})

const editorCtx = ref<any>(null)
const toolbarRef = ref<any>(null)

const articleInfo = reactive({
  articleId: undefined as number | undefined,
  title: '',
  content: '',
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
</script>
