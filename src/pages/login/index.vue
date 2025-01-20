<template>
  <view>
    <up-navbar title="" placeholder />
    <view>
      <view class="mt-10 text-align-center text-[20px]">
        <h1>手机号登录</h1>
        <span class="text-[12px] text-[#afafaf]">
          未注册的手机号验证通过后将自动注册
        </span>
      </view>
      <view class="w-[300rpx] min-w-[280px] max-w-[400px] m-[150rpx_auto_0]">
        <up-form>
          <!-- 手机号表单行 -->
          <up-form-item name="phoneNumber">
            <up-input label="86" placeholder="手机号">
              <template #prefix>
                <div class="flex items-center text-[12px]">
                  +86
                  <up-icon class="ml-[3px]" name="arrow-down" :size="12" />
                </div>
              </template>
            </up-input>
          </up-form-item>
          <!-- 验证码表单行 -->
          <up-form-item name="captcha">
            <up-input placeholder="验证码">
              <template #suffix>
                <view class="text-[13px] pr-[5px]">获取验证码</view>
              </template>
            </up-input>
          </up-form-item>
          <!-- 策略表单行 -->
          <view class="flex items-center text-[12px] text-[#ccc] mb-[10px]">
            <up-checkbox
              size="13"
              activeColor="var(--primary-color)"
              usedAlone
            />
            <span>
              我已阅读并同意签署
              <span class="text-[#3478f6]">用户协议</span>
              和
              <span class="text-[#3478f6]">隐私政策</span>
            </span>
          </view>
        </up-form>
        <up-button color="var(--primary-color)" type="primary">登录</up-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts"></script>
