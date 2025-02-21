<template>
  <view>
    <view class="text-[#333] text-[13px]">
      共{{ commentList.length }}条评论
    </view>
    <view class="flex items-center my-10px">
      <up-avatar
        class="mx-[10px]"
        :src="baseURL + '' + userInfo?.avatarLink"
        :size="40"
      />
      <up-input
        disabled
        placeholder="爱评论的人运气都不差"
        placeholder-class="bg-#f4f4f4 text-#bababa rounded-full"
        @click="commentPopup.show = true"
      />
    </view>
    <!-- 评论区 -->
    <view
      class="flex"
      v-for="(parentCom, index) in commentList.filter(
        ({ parentCommentId }) => !parentCommentId
      )"
    >
      <up-avatar :src="baseURL + '' + parentCom?.avatarLink" :size="40" />
      <view class="flex-1">
        <view></view>
      </view>
      <view></view>
    </view>
    <up-popup :show="commentPopup.show" @close="commentPopup.show = false">
      <SvEditor
        class="text-15px"
        pasteMode="origin"
        placeholder="爱评论的人运气都不差"
        @ready="ready"
        @input="({ text = '', html = '' }) => (commentContent = html)"
      />
      <SvEditorToolbar
        ref="toolbarRef"
        :tools="['emoji']"
        :moreTools="['image']"
        :toolbarStyle="{ flex: 'none', width: 'auto' }"
        :toolbarItemStyle="{ flex: 'none', width: '80rpx' }"
        :activeToolStyle="{ color: 'var(--primary-color)' }"
        @moreItemConfirm="moreItemConfirm"
      >
        <template #toolbarRight>
          <view class="mr-10px">
            <up-button
              :size="'small'"
              :disabled="commentContent.length === 0"
              type="primary"
              class="bg-[var(--primary-color)]"
              @click="
                async () => {
                  await addArticleComment({
                    articleId,
                    content: commentContent,
                  })
                  emit('updateCommentList')
                  showToast({ title: '评论成功', icon: 'none' })
                }
              "
            >
              发送
            </up-button>
          </view>
        </template>
      </SvEditorToolbar>
    </up-popup>
  </view>
</template>

<script setup lang="ts">
import { baseURL, uploadFile } from '@/api/http'
import type {
  ArticleCommentProps,
  ArticleProps,
  UserProps,
} from '@/service/types/db'
import SvEditor from '@/plugins/sv-editor/components/sv-editor/sv-editor.vue'
import SvEditorToolbar from '@/plugins/sv-editor/components/sv-editor/sv-editor-toolbar.vue'
import { addImage } from '@/plugins/sv-editor/components/common/utils'
import { reactive, ref } from 'vue'
import { addArticleComment } from '@/service'

type Props = {
  commentList: (ArticleCommentProps &
    Pick<UserProps, 'nickname' | 'avatarLink'>)[]
  userInfo: Pick<ArticleProps, 'userId'> &
    Pick<UserProps, 'nickname' | 'avatarLink'>
  articleId: number
}

const props = defineProps<Props>()

const emit = defineEmits(['updateCommentList'])

const editorCtx = ref<any>(null)
const toolbarRef = ref<any>(null)
const commentContent = ref('')
const commentPopup = reactive({
  show: false,
})

const ready = (e: any) => {
  editorCtx.value = e
}
const showToast = (options: UniNamespace.ShowToastOptions) => {
  uni.showToast(options)
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
  // 关闭弹窗
  toolbarRef.value.closeMorePop()
}
</script>

<style scoped></style>
