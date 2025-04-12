<template>
  <up-popup
    :show="reportPopup.show"
    mode="center"
    closeable
    @close="reportPopup.show = false"
  >
    <view class="p-[40px_16px_12px]">
      <up-form
        ref="reportFormRef"
        :model="reportPopup.formInfo.model"
        :rules="reportPopup.formInfo.rules"
      >
        <up-form-item prop="reason" label="举报原因：" :labelWidth="100">
          <up-input v-model="reportPopup.formInfo.model.reason" />
        </up-form-item>
      </up-form>
      <view class="mt-[20px]">
        <up-button
          type="primary"
          text="确定"
          @click="reportPopup.formInfo.onOk"
        />
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { report } from '@/service'
import type { ReportRecordProps } from '@/service/types/db'
import type { _FormRef } from 'uview-plus/types/comps/form'
import { reactive, ref } from 'vue'

const props = defineProps<Pick<ReportRecordProps, 'targetId' | 'targetType'>>()
const emit = defineEmits(['success'])
const reportPopup = reactive({
  show: false,
  formInfo: {
    model: {
      reason: '',
    },
    rules: {
      reason: {
        type: 'string',
        required: true,
        message: '请输入举报原因',
        trigger: ['blur'],
      },
    },
    onOk: async () => {
      await reportFormRef.value?.validate()
      const { reason } = reportPopup.formInfo.model
      await report({
        reason,
        ...props,
      })
      uni.showToast({
        title: '举报成功',
        icon: 'none',
      })
      reportPopup.show = false
      emit('success')
    },
  },
})
const reportFormRef = ref<_FormRef>()

export type ReportRefType = {
  reportPopup: typeof reportPopup
  reportFormRef: _FormRef
}

defineExpose({
  reportPopup,
  reportFormRef,
})
</script>
