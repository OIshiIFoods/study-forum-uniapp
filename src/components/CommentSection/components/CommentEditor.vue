<template>
  <up-popup :show="isShowPopup" :onClose="() => (isShowPopup = false)">
    <view v-if="isShowPopup" class="bg-white box-border p-10px">
      <view>
        <SvEditor
          class="rounded-8px bg-[rgba(224,224,224,.5)] text-13px w-full box-border p-10px max-h-200rpx"
          pasteMode="origin"
          :placeholder="inputContent.placeholder || '留下你的想法吧'"
          @ready="(e: any) => (editorCtx = e)"
          @input="({ text = '', html = '' }) => (inputContent.content = text)"
        />
      </view>
      <SvEditorToolbar
        ref="toolbarRef"
        :tools="['emoji']"
        :toolbarStyle="{ flex: 'none', width: 'auto' }"
        :toolbarItemStyle="{ flex: 'none', width: '80rpx' }"
        :activeToolStyle="{ color: 'var(--primary-color)' }"
      >
        <template #toolbarRight>
          <view class="flex gap-10px mr-10px">
            <up-button
              :disabled="inputContent.content.length === 0"
              :shape="'circle'"
              :type="'primary'"
              :size="'small'"
              @click="emit('send', toRaw(inputContent))"
            >
              发送
            </up-button>
          </view>
        </template>
      </SvEditorToolbar>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch } from 'vue'
import SvEditor from '@/plugins/sv-editor/components/sv-editor/sv-editor.vue'
import SvEditorToolbar from '@/plugins/sv-editor/components/sv-editor/sv-editor-toolbar.vue'

const emit = defineEmits(['send'])

const editorCtx = ref<any>(null)

const isShowPopup = ref(false)
const inputContent = reactive({
  placeholder: '',
  content: '',
})

/** 当弹窗关闭时重置信息 */
watch(
  () => isShowPopup.value,
  (val) => {
    if (!val) {
      editorCtx.value.setContents({
        html: '',
      })
      inputContent.content = ''
      inputContent.placeholder = ''
    }
  }
)

export type EditorRefType = {
  inputContent: {
    placeholder: string
    content: string
  }
  isShowPopup: boolean
}

defineExpose({
  inputContent,
  isShowPopup,
})
</script>
