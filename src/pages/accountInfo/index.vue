<template>
  <view class="h-100vh bg-#f1f2f4 overflow-auto">
    <up-navbar title="账号资料" placeholder auto-back />
    <up-cell-group class="mt-20px bg-#fff">
      <up-cell is-link title="头像">
        <template #value>
          <up-avatar
            :src="baseURL + '' + userStore.avatarLink"
            shape="square"
          />
        </template>
      </up-cell>
      <up-cell
        is-link
        title="昵称"
        :value="userStore.nickname"
        :onClick="() => showModifyInfoPopup('modifyNickname')"
      />
      <up-cell is-link title="性别" :value="sexMap[userStore.sex ?? 0]" />
      <up-cell is-link title="出生年月" :value="'生日当天会收到祝福'" />
      <up-cell is-link title="个性签名" :value="userStore.signature" />
    </up-cell-group>
  </view>
  <up-popup :show="popupConfig.show" mode="right">
    <view class="h-100vh w-100vw bg-#f1f2f4 overflow-auto box-border px-10px">
      <up-navbar
        :title="popupConfig.title"
        placeholder
        @left-click="popupConfig.show = false"
      />
      <up-form
        :model="popupConfig.formInfo.model"
        :rules="popupConfig.formInfo.rules"
        :errorType="'toast'"
        ref="modifyInfoFormRef"
      >
        <!-- nickname 表单项 -->
        <up-form-item
          v-if="popupConfig.showFields.includes('nickname')"
          prop="nickname"
        >
          <up-input
            v-model="popupConfig.formInfo.model.nickname"
            :type="'nickname'"
            :placeholder="'起一个响亮的名字吧'"
            :maxlength="24"
            :custom-style="{ backgroundColor: '#fff', border: '0' }"
            :cursor="'var(--primary-color)'"
          />
          <view class="text-right text-13px text-#999 py-10px">
            请设置2-24个字符
          </view>
        </up-form-item>
      </up-form>
      <up-button
        :custom-style="{ width: '150px' }"
        :color="'var(--primary-color)'"
        :shape="'circle'"
        @click="handleSave"
      >
        保存
      </up-button>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import { sexMap } from '@/config/constant'
import router from '@/router'
import { putUserInfo } from '@/service'
import { useUserStore } from '@/stores'
import { filterObjectByKeys } from '@/utils'
import type { _FormRef } from 'uview-plus/types/comps/form'
import { reactive, ref } from 'vue'

const userStore = useUserStore()

const modifyInfoFormRef = ref<_FormRef>()
const popupConfig = reactive({
  show: false,
  title: '',
  formType: '',
  showFields: [] as string[],
  formInfo: {
    model: {
      nickname: userStore.nickname,
    },
    rules: {
      nickname: [
        {
          required: true,
          pattern: /.{2,24}/,
          message: '请输入2-24个字符',
        },
      ],
    },
  },
})

const showModifyInfoPopup = (formType: string) => {
  const formMap: Record<string, any> = {
    modifyNickname: {
      title: '编辑昵称',
      formType: 'modifyNickname',
      showFields: ['nickname'],
    },
  }
  Object.assign(popupConfig, { show: true, ...(formMap[formType] ?? {}) })
}

const handleSave = async () => {
  await modifyInfoFormRef?.value?.validate()
  await putUserInfo(
    filterObjectByKeys(popupConfig.formInfo.model, popupConfig.showFields)
  )
  await userStore.syncUserInfo()
  uni.showToast({
    title: '修改成功',
    icon: 'none',
  })
  setTimeout(() => {
    popupConfig.show = false
  }, 500)
}
</script>
