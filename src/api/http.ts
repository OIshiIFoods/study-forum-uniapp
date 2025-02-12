const baseURL = process.env.BASE_URL

const httpInterceptor: UniApp.InterceptorOptions = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions) {
    // 非http开头拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
      options.data = JSON.parse(JSON.stringify(options.data ?? {}))
    }
  },
  // 处理响应数据
  success(res) {},
  fail() {},
  complete() {},
  returnValue(res) {
    return res
  },
}

uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

interface Data<T> {
  data: T
}

export const request = <T>(options: UniApp.RequestOptions) => {
  return new Promise<Data<T>>((resolve) => {
    uni.request({
      ...options,
      success(res) {
        resolve(res.data as Data<T>)
      },
      fail(res) {
        return Promise.reject(res)
      },
    })
  })
}
