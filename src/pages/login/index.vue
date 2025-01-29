<template>
  <view>
    <up-navbar title="" placeholder autoBack />
    <view>
      <view class="mt-10 text-align-center text-[20px]">
        <h1>手机号登录</h1>
        <span class="text-[12px] text-[#afafaf]">
          未注册的手机号验证通过后将自动注册
        </span>
      </view>
      <view class="w-[300rpx] min-w-[280px] max-w-[400px] m-[150rpx_auto_0]">
        <up-form :model="formInfo.model" :rules="formInfo.rules" ref="formRef">
          <!-- 手机号表单行 -->
          <up-form-item prop="phoneNumber">
            <up-input
              label="86"
              v-model="formInfo.model.phoneNumber"
              placeholder="手机号"
            >
              <template #prefix>
                <div class="flex items-center text-[12px]">
                  +86
                  <up-icon class="ml-[3px]" name="arrow-down" :size="12" />
                </div>
              </template>
            </up-input>
          </up-form-item>
          <!-- 验证码表单行 -->
          <up-form-item prop="captcha">
            <up-input v-model="formInfo.model.captcha" placeholder="验证码">
              <template #suffix>
                <view
                  class="text-[13px] pr-[5px]"
                  v-if="!formInfo.isCaptchaDisabled"
                  @click="
                    () => {
                      handleGetCaptchaClick()
                    }
                  "
                >
                  获取验证码
                </view>
                <up-count-down
                  v-else
                  class="text-[13px] pr-[5px]"
                  :time="formInfo.captchaInterval"
                  format="ss"
                  @change="(e) => (formInfo.timeData = e)"
                  @finish="() => (formInfo.isCaptchaDisabled = false)"
                >
                  {{ formInfo.timeData.seconds }}秒后重新获取
                </up-count-down>
              </template>
            </up-input>
          </up-form-item>
          <!-- 策略表单行 -->
          <up-form-item prop="isAgree">
            <view class="flex items-center text-[12px] text-[#ccc]">
              <up-checkbox
                size="13"
                activeColor="var(--primary-color)"
                :inactiveColor="formInfo.checkboxInactiveColor"
                usedAlone
                v-model:checked="formInfo.model.isAgree"
              />
              <span>
                我已阅读并同意签署
                <span class="text-[#3478f6]">用户协议</span>
                和
                <span class="text-[#3478f6]">隐私政策</span>
              </span>
            </view>
          </up-form-item>
        </up-form>
        <up-button
          color="var(--primary-color)"
          type="primary"
          @click="() => handleLoginClick()"
        >
          登录
        </up-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import router from '@/router'
import { getCaptcha, getUserInfo, login } from '@/service'
import { useUserStore } from '@/stores'
import type { _FormRef } from 'uview-plus/types/comps/form'
import { reactive, ref } from 'vue'
const formRef = ref<_FormRef>()
const formInfo = reactive({
  model: {
    phoneNumber: '',
    captcha: '',
    isAgree: false,
  },
  rules: {
    phoneNumber: {
      type: 'string',
      required: true,
      message: '请输入11位手机号',
      pattern: /\d{11}/,
      trigger: ['blur'],
    },
    captcha: {
      type: 'string',
      required: true,
      message: '请输入验证码',
      trigger: ['blur', 'change'],
    },
    isAgree: {
      type: 'boolean',
      trigger: ['change'],
      message: ' ',
      validator: (rule: any, value: any) => {
        formInfo.checkboxInactiveColor = value ? '' : 'red'
        return value
      },
    },
  },
  isCaptchaDisabled: false,
  captchaInterval: 0,
  checkboxInactiveColor: '',
  timeData: {} as any,
})
const handleGetCaptchaClick = async () => {
  formRef.value?.validateField('phoneNumber', async (errorsRes) => {
    if (errorsRes.length === 0) {
      const { data } = await getCaptcha({
        phoneNumber: formInfo.model.phoneNumber,
      })
      formInfo.isCaptchaDisabled = true
      formInfo.captchaInterval = data.effectiveDuration * 1000
    }
  })
}

const handleLoginClick = async () => {
  try {
    await formRef.value?.validate()
    const { phoneNumber, captcha } = formInfo.model
    const { data } = await login({ phoneNumber, captcha })
    uni.setStorageSync('token', data.token)
    uni.showToast({
      title: '登录成功',
      icon: 'success',
    })
    getUserInfo().then((res) => {
      const userStore = useUserStore()
      userStore.$patch(res.data)
    })
    router.pushTab('/pages/index/index')
  } catch (err) {}
}
</script>
