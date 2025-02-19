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
        @input="(content: string) => (articleInfo.content = content)"
      />
    </view>
    <sv-editor-toolbar
      ref="toolbarRef"
      :style-tools="[
        'header',
        'divider',
        'bold',
        'italic',
        'underline',
        'strike',
        'align',
        'color',
        'backgroundColor',
        'removeformat',
      ]"
      @moreItemConfirm="moreItemConfirm"
    ></sv-editor-toolbar>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
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

const editorCtx = ref<any>(null)
const toolbarRef = ref<any>(null)

const articleInfo = reactive({
  title: '',
  content: '',
})

const ready = (e: any) => {
  editorCtx.value = e
}

const moreItemConfirm = async (e: any) => {
  console.log('moreItemConfirm ==>', e)
  // 添加图片
  if (e.name == 'image') {
    const imageRes = await addImage(
      async () => {
        return new Promise((resolve) => {
          uni.showLoading({ title: '上传中' })
          setTimeout(() => {
            uni.hideLoading()
            let images: any[] = []
            if (e.link) images.push({ path: e.link })
            if (e.file?.length) images = images.concat(e.file)
            resolve(images)
          }, 3000)
        })
      },
      { srcFiled: 'path' }
    )
    if (imageRes) {
      uni.showToast({ title: '添加图片成功', icon: 'success' })
    } else {
      uni.showToast({ title: '添加图片失败', icon: 'error' })
    }
  }

  // 添加视频
  if (e.name == 'video') {
    const videoRes = await addVideo(
      async (editorCtx: any) => {
        return new Promise((resolve) => {
          uni.showLoading({ title: '上传中' })
          setTimeout(async () => {
            uni.hideLoading()
            let videos: any[] = []
            if (e.link) {
              const linkThumbnail = await editorCtx.createVideoThumbnail(e.link)
              videos.push({
                imagePath: linkThumbnail,
                tempFilePath: e.link,
              })
            }
            if (e.file.tempFilePath) {
              const fileThumbnail = await editorCtx.createVideoThumbnail(
                e.file.tempFilePath
              )
              e.file.imagePath = fileThumbnail
              videos.push(e.file)
            }
            resolve(videos)
          }, 3000)
        })
      },
      { imageFiled: 'imagePath', videoFiled: 'tempFilePath', width: '100%' }
    )
    if (videoRes) {
      uni.showToast({ title: '添加视频成功', icon: 'success' })
    } else {
      uni.showToast({ title: '添加视频失败', icon: 'error' })
    }
  }

  // 添加链接
  if (e.name == 'link') {
    addLink({ link: e.link, text: e.text }, () => {
      uni.showToast({ title: '添加链接成功' })
    })
  }

  // 添加附件
  if (e.name == 'attachment') {
    const attachmentRes = await addAttachment(async () => {
      return new Promise((resolve) => {
        uni.showLoading({ title: '上传中' })
        setTimeout(() => {
          uni.hideLoading()
          let attachmentObj = e
          if (e.file.path) {
            attachmentObj.path = e.file.path
          } else if (e.link) {
            attachmentObj.path = e.link
          }
          resolve(attachmentObj)
        }, 3000)
      })
    })
    if (attachmentRes) {
      uni.showToast({ title: '添加附件成功', icon: 'success' })
    } else {
      uni.showToast({ title: '添加附件失败', icon: 'error' })
    }
  }

  // 关闭弹窗
  toolbarRef.value.closeMorePop()
}
</script>
