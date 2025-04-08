<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import router from '@/router'
import { useUserStore } from './stores'
import { useUserMessage } from './hooks/useUserMessage'
import { useNotice } from './hooks/useNotice'
onLaunch(async () => {
  // 判断用户是否已登录
  if (!uni.getStorageSync('token')) {
    uni.showModal({
      title: '提示',
      content: '登录凭证已过期，请重新登录！',
      confirmText: '确认',
      cancelText: '取消',
      success: (success) => {
        if (success.confirm) {
          router.push({
            name: 'login',
          })
        }
      },
    })
  } else {
    // 初始化用户信息
    const userStore = useUserStore()
    await userStore.syncUserInfo()
    // 初始化消息信息
    const { initData } = useUserMessage()
    await initData()
    // 初始化通知信息
    const { syncRemoteNotices } = useNotice()
    await syncRemoteNotices()
  }
  console.log('App Launch')
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>
<style lang="scss">
@import 'uview-plus/index.scss';
@import '@/static/css/iconfont.css';

page {
  --primary-color: #59a3f4;
  --shallow-primary-color: #dff0ff;
  --bg-primary-color: #e5f1fc;
  --page-side-unit-size: 5rpx;
  --text-color-grey: #999;
  --bg-color-grey: #f1f2f4;
}

// 处理uview-plus的tooltip文本换行问题
.u-tooltip__wrapper__text {
  word-wrap: break-word; /* 允许长单词或 URL 地址换行到下一行 */
  word-break: break-all; /* 在单词内断行 */
  white-space: pre-wrap; /* 保留空白符序列并允许换行 */
}

// 修复悬浮按钮加号未居中问题
.u-float-button__main {
  display: flex;
}
</style>
