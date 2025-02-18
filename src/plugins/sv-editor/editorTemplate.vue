<template>
  <view
    class="box-border flex flex-col"
    style="height: calc(100vh - var(--window-top) - env(safe-area-inset-bottom))"
  >
    <view
      class="flex-1 overflow-y-auto box-border b-10px b-solid b-[#66ccff]"
    >
      <sv-editor
        pasteMode="origin"
        @ready="ready"
        @input="input"
        @overmax="overMax"
        @epaste="epaste"
      ></sv-editor>
    </view>
    <view class="sticky bottom-0 w-full">
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
        @changeTool="changeTool"
        @toolMoreItem="onToolMoreItem"
        @moreItemConfirm="moreItemConfirm"
      >
        <template #at>
          <view class="flex flex-col">
            <view
              v-for="item in atList"
              :key="item.id"
              class="panel-at-item p-10 my-10 box-border rounded-20 shadow-[0_0_8px_6px_rgba(0,0,0,0.08)]"
              @click="onAt(item)"
            >
              {{ item.name }}
            </view>
          </view>
        </template>
        <template #topic>
          <view class="panel-topic flex flex-col">
            <view
              v-for="item in topicList"
              :key="item.id"
              class="panel-topic-item p-10 my-10 box-border rounded-20"
              style="box-shadow: 0 0 8px 6px rgba(0, 0, 0, 0.08)"
              @click="onTopic(item)"
            >
              {{ item.name }}
            </view>
          </view>
        </template>
        <template #setting>
          <button size="mini" @click="onExport">导出</button>
        </template>
      </sv-editor-toolbar>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SvEditorToolbar from './components/sv-editor/sv-editor-toolbar.vue'
import SvEditor from './components/sv-editor/sv-editor.vue'
import {
  addAt,
  addTopic,
  addAttachment,
  addImage,
  addLink,
  addVideo,
} from './components/common/utils'

// 定义 toolbarRef
const toolbarRef = ref<any>(null)

const atList = ref([
  { name: '马什么梅', id: 1 },
  { name: '什么冬梅', id: 2 },
  { name: '马冬什么', id: 3 },
])

const topicList = ref([
  { name: '今日资讯', id: 'news' },
  { name: '热搜', id: 'hot' },
  { name: '开心一下', id: 'happy' },
])

const editorCtx = ref<any>(null)

const ready = (e: any) => {
  editorCtx.value = e
  editorCtx.value.initHtml(
    `<p style="text-align: center;">
      <video controls width="80%" id="video-1"><source src="http://qiniu.sonve.asia/myvideos/cxk.mp4" /></video>
    </p>
    <p style="text-align: center;">
      <video controls width="80%" id="video-2"><source src="http://qiniu.sonve.asia/myvideos/monkeybrother.mp4" /></video>
    </p>
    <p style="text-align: center;">
      🏀开发时长两年半🏀
    </p>`,
    async (videoUrl: string) => {
      const fox =
        'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg'
      const res = await editorCtx.value.createCoverThumbnail(fox)
      return res
    }
  )
}

const input = (e: any) => {
  console.log('input ==>', e)
}

const epaste = (e: any) => {
  console.log('epaste ==>', e)
}

const overMax = (e: any) => {
  console.log('overMax ==>', e)
}

const changeTool = (e: any) => {
  console.log('changeTool ==>', e)
}

const onToolMoreItem = (e: any) => {
  console.log('onToolMoreItem ==>', e)
  if (e.name == 'clear') {
    uni.showModal({
      title: '提示',
      content: '确定要清空内容吗？',
      success: ({ confirm }) => {
        if (confirm) {
          editorCtx.value.clear()
        }
      },
    })
  }
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

const onAt = (e: any) => {
  addAt({ username: e.name, userid: e.id }, () => {
    uni.showToast({ title: '艾特成功' })
  })
  toolbarRef.value.closeMorePop()
}

const onTopic = (e: any) => {
  addTopic({ topic: e.name, link: e.id }, () => {
    uni.showToast({ title: '添加话题成功' })
  })
  toolbarRef.value.closeMorePop()
}

const onExport = async () => {
  const contentRes = await editorCtx.value.getLastContent()
  const htmlHandler = editorCtx.value.exportHtml(contentRes.html)
  uni.navigateTo({
    url: '/pages/out/out',
    success: (res) => {
      res.eventChannel.emit('E_HTML_EXPORT', { data: htmlHandler })
    },
  })
}
</script>
