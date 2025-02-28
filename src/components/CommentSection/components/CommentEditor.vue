<template>
  <up-popup :show="isShowPopup" :onClose="() => (isShowPopup = false)">
    <view class="bg-white box-border p-10px">
      <view>
        <textarea
          class="rounded-8px bg-[rgba(224,224,224,.5)] text-13px w-full box-border p-10px min-h-100rpx"
          v-model="inputContent.content"
          :placeholder="inputContent.placeholder || '留下你的想法吧'"
        />
      </view>
      <view class="flex justify-between my-6px">
        <view class="flex gap-row-5px"></view>
        <view>
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
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch } from 'vue'

const inputContent = reactive({
  placeholder: '',
  content: '',
})

const emit = defineEmits(['send'])

const isShowPopup = ref(false)

/** 当弹窗关闭时重置信息 */
watch(
  () => isShowPopup.value,
  (val) => {
    if (!val) {
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
