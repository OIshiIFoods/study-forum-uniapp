<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import router from '@/router'
import { getUserInfo } from '@/service'
import { useUserStore } from './stores'
onLaunch(() => {
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
    getUserInfo().then((res) => {
      const userStore = useUserStore()
      userStore.$patch(res.data)
    })
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
  --page-side-unit-size: 5rpx;
  --text-color-grey: #999;
}
</style>
