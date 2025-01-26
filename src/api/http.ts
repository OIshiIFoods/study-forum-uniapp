const baseURL = process.env.BASE_URL

const httpInterceptor: UniApp.InterceptorOptions = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions) {
    // 非http开头拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
      options.header = {
        cookie: uni.getStorageSync('cookie'),
        Authorization: `Bearer ${uni.getStorageSync('token')}`,
      }
    }
  },
  // 处理响应数据
  success(res) {
    // 将 cookie 存储到本地
    if (res?.header['Set-Cookie']) {
      const cookies = res?.header['Set-Cookie']?.split(/,(?!\s)/)
      // 响应头中的 cookie
      const cookieObj = Object.fromEntries(
        cookies?.map((item: string) => item.split(';')[0]?.split('=')) ?? [[]]
      )
      // 本地存储的 cookie
      const curCookieObj = Object.fromEntries([
        ...uni
          .getStorageSync('cookie')
          ?.split(';')
          ?.map((item: string) => item.split('=')),
      ])
      // 更新本地 cookie
      uni.setStorageSync(
        'cookie',
        Object.entries(
          JSON.parse(JSON.stringify({ ...curCookieObj, ...cookieObj }))
        )
          .map((item) => item.join('='))
          .join(';')
      )
    }
  },
  fail() {},
  complete() {},
  returnValue(res) {},
}

uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

export const request = <T>(options: UniApp.RequestOptions) => {
  return new Promise<T>((resolve) => {
    uni.request({
      ...options,
      success(res) {
        const { data } = res as any
        // 请求失败
        if (data.failed) {
          uni.showToast({
            title: data.message,
            icon: 'none',
            duration: 2000,
          })
          return Promise.reject(data)
        }
        resolve(res.data as T)
      },
      fail(res) {
        uni.showToast({
          title: '网络异常，请稍后重试！' + res.errMsg,
          icon: 'none',
          duration: 2000,
        })
        return Promise.reject(res)
      },
    })
  })
}
