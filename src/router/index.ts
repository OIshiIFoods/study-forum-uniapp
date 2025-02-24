import { createRouter } from 'uni-mini-router'
// 导入pages.json
import pagesJson from '@/pages.json'
// 引入uni-parse-pages
import pagesJsonToRoutes from 'uni-parse-pages'
import { useUserStore } from '@/stores'
// 生成路由表
const routes = pagesJsonToRoutes(pagesJson)
const router = createRouter({
  routes: [...routes], // 路由表信息
})
router.beforeEach(async (to, from, next) => {
  // 登录凭证校验
  if (to.name !== 'login' && !uni.getStorageSync('token')) {
    const userStore = useUserStore()
    userStore.$reset()
    await new Promise((resolve) => {
      uni.showModal({
        title: '提示',
        content: '登录凭证已过期，请重新登录！',
        confirmText: '确认',
        cancelText: '取消',
        success: (success) => {
          if (success.confirm) {
            resolve(true)
            next({
              name: 'login',
            })
          }
        },
      })
    })
  } else {
    next()
  }
})
export default router
