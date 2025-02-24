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
      <up-cell
        is-link
        title="性别"
        :value="sexMap[userStore.sex ?? 0]"
        @click="showModifyInfoPopup('modifySex')"
      />
      <up-cell
        is-link
        title="出生年月"
        :value="'生日当天会收到祝福'"
        @click="showModifyInfoPopup('modifyBirthday')"
      />
      <up-cell
        is-link
        title="个性签名"
        :value="userStore.signature"
        @click="showModifyInfoPopup('modifySignature')"
      />
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
        <!-- sex 表单项  -->
        <up-form-item v-if="popupConfig.showFields.includes('sex')" prop="sex">
          <up-radio-group
            :customStyle="{
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: '#fff',
            }"
            :activeColor="'var(--primary-color)'"
            v-model="popupConfig.formInfo.model.sex"
            placement="column"
            iconPlacement="right"
          >
            <view
              v-for="(item, index) in Object.entries(sexMap)"
              :key="item[0]"
            >
              <up-radio :name="+item[0]" :label="item[1]" />
              <up-line
                v-if="index !== Object.entries(sexMap).length - 1"
                color="#eaebec"
              />
            </view>
          </up-radio-group>
        </up-form-item>
        <!-- 签名表单项 -->
        <up-form-item
          v-if="popupConfig.showFields.includes('signature')"
          prop="signature"
        >
          <up-textarea
            v-model="popupConfig.formInfo.model.signature"
            :maxlength="200"
            :height="'200px'"
            placeholder="点击输入个性签名"
            count
          />
        </up-form-item>
        <!-- 生日表单项 -->
        <view v-if="popupConfig.showFields.includes('birthday')">
          <up-cell-group class="mt-20px bg-#fff">
            <up-cell
              is-link
              title="生日信息"
              :value="
                popupConfig.formInfo.model.birthday
                  ? dayjs(popupConfig.formInfo.model.birthday).format(
                      'YYYY-MM-DD'
                    )
                  : '选择你的生日'
              "
              @click="popupConfig.tempVar.isShowDatePicker = true"
            />
          </up-cell-group>
          <up-datetime-picker
            :show="popupConfig.tempVar.isShowDatePicker"
            v-model="popupConfig.formInfo.model.birthday"
            mode="date"
            @confirm="popupConfig.tempVar.isShowDatePicker = false"
            @cancel="popupConfig.tempVar.isShowDatePicker = false"
            @close="popupConfig.tempVar.isShowDatePicker = false"
            closeOnClickOverlay
          />
        </view>
      </up-form>
      <up-button
        :custom-style="{ width: '150px', margin: '20px auto' }"
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
import dayjs from 'dayjs'
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
      sex: userStore.sex,
      signature: userStore.signature,
      birthday: userStore.birthday,
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
  tempVar: {
    isShowDatePicker: false,
  },
})

const showModifyInfoPopup = (formType: string) => {
  const formMap: Record<string, any> = {
    modifyNickname: {
      title: '编辑昵称',
      formType: 'modifyNickname',
      showFields: ['nickname'],
    },
    modifySex: {
      title: '编辑性别',
      formType: 'modifySex',
      showFields: ['sex'],
    },
    modifySignature: {
      title: '编辑签名',
      formType: 'modifySignature',
      showFields: ['signature'],
    },
    modifyBirthday: {
      title: '编辑生日',
      formType: 'modifyBirthday',
      showFields: ['birthday'],
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
