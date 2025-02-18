<template>
  <up-navbar :title="'写文章'" placeholder auto-back />
  <view class="p-[0_15px]">
    <up-textarea
      v-model="articleInfo.title"
      placeholder="请输入标题"
      placeholderClass="text-16px"
      count
      height="25px"
      :maxlength="20"
      border="bottom"
    />
    <sv-editor
      pasteMode="origin"
      @ready="ready"
      @input="(content: string) => (articleInfo.content = content)"
    />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const editorCtx = ref<any>(null)

const articleInfo = reactive({
  title: '',
  content: '',
})

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
</script>
