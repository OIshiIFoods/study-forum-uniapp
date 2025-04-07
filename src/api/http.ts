import type {
  GetFileChunkInfo,
  PostMergeChunks,
  PostUploadFile,
} from '@/service/types/api'
import { getFileContent } from '@/utils'
import SparkMD5 from 'spark-md5'

export const baseURL = process.env.BASE_URL
export const localTempPath = `${wx.env.USER_DATA_PATH}`

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
      options.data = JSON.parse(JSON.stringify(options.data ?? {}))
    }
  },
  // 处理响应数据
  success(res) {
    // 将 cookie 存储到本地
    if (res.cookies) {
      const cookies = res.cookies
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
    // 处理 uploadFile 上传文件后，响应内容为 string 的情况
    if (typeof res.data === 'string') {
      res.data = JSON.parse(res.data)
    }
    // token 过期时
    if (res.data.status === 401) {
      uni.removeStorageSync('token')
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

export const uploadFile = async (
  fileType: 'avatar' | 'file' | 'archiver' | 'articleImg',
  fileInfoList: Pick<
    UniNamespace.UploadFileOption,
    'name' | 'filePath' | 'file' | 'formData'
  >[] = []
) => {
  return (
    await Promise.allSettled(
      fileInfoList.map((fileInfo) => {
        return new Promise((resolve, reject) => {
          uni.uploadFile({
            url: '/api/v1/upload/file/' + fileType,
            ...fileInfo,
            success: (res) => {
              const uploadRes = res.data as unknown as PostUploadFile.Response
              resolve(uploadRes.data.uploadFileInfoList[0])
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
      })
    )
  ).reduce(
    (acc, cur) => {
      if (cur.status === 'fulfilled') {
        acc.success.push(cur.value)
      } else {
        acc.fail.push(cur.reason)
      }
      return acc
    },
    {
      success: [] as any[],
      fail: [] as any[],
    }
  )
}

export const uploadFileChunks = async (
  fileType: 'avatar' | 'file' | 'archiver' | 'articleImg',
  fileInfoList: (Pick<UniNamespace.UploadFileOption, 'name' | 'formData'> & {
    filename: string
    filePath: string
    size: number
  })[] = []
) => {
  // 分片大小
  const chunkSize = 8 * 1024 * 1024
  return (
    await Promise.allSettled(
      fileInfoList.map((fileInfo) => {
        return new Promise(async (resolve, reject) => {
          /** 文件 md5 */
          const fileMd5 = await calculateFileMD5({
            filePath: fileInfo.filePath,
          })
          const getChunkRes = (await request({
            method: 'GET',
            url: `/api/v1/upload/checkChunk/${fileType}`,
            data: {
              fileMd5,
            },
          })) as GetFileChunkInfo.Response
          /** 检查已上传的分片 */
          const uploadedChunks = getChunkRes.data.uploadedChunks
          /** 分片数 */
          const totalChunks = Math.ceil(fileInfo.size / chunkSize)
          const uploadChunk = async (uploadedChunks: number[]) => {
            for (let i = 0; i < totalChunks; i++) {
              // 跳过已上传的分片
              if (uploadedChunks.includes(i)) continue
              const start = i * chunkSize
              const end = Math.min(start + chunkSize, fileInfo.size)
              // 获取分片
              const chunk = await getFileContent({
                filePath: fileInfo.filePath,
                position: start,
                length: end - start,
              })
              const chunkTempPath = localTempPath + `/${fileMd5}`
              await new Promise((resolve, reject) => {
                wx.getFileSystemManager().writeFile({
                  data: chunk,
                  filePath: chunkTempPath,
                  encoding: 'binary',
                  success(params) {
                    resolve(params)
                  },
                  fail(err) {
                    reject(err)
                  },
                })
              })

              await new Promise((resolve, reject) => {
                uni.uploadFile({
                  url: '/api/v1/upload/chunks/' + fileType,
                  name: i + '',
                  filePath: chunkTempPath,
                  formData: {
                    fileMd5,
                    chunkIndex: i,
                  },
                  success: (res) => {
                    wx.getFileSystemManager().unlink({
                      filePath: chunkTempPath,
                    })
                    resolve(res)
                  },
                  fail(res) {
                    return Promise.reject(res)
                  },
                })
              })
            }
          }
          await uploadChunk(uploadedChunks)
          const mergeChunkRes = (await request({
            method: 'POST',
            url: `/api/v1/upload/mergeChunks/${fileType}`,
            data: {
              fileMd5,
              totalChunks,
              filename: fileInfo.filename,
            },
          })) as PostMergeChunks.Response
          if ('uploadedChunks' in mergeChunkRes.data) {
            uploadChunk(mergeChunkRes.data.uploadedChunks)
            setTimeout(() => {
              // 不添加if判断会报错
              if ('uploadedChunks' in mergeChunkRes.data) {
                uploadChunk(mergeChunkRes.data.uploadedChunks)
              }
            }, 2000)
          } else {
            resolve(mergeChunkRes.data)
          }
        })
      })
    )
  ).reduce(
    (acc, cur) => {
      if (cur.status === 'fulfilled') {
        acc.success.push(cur.value)
      } else {
        acc.fail.push(cur.reason)
      }
      return acc
    },
    {
      success: [] as any[],
      fail: [] as any[],
    }
  )
  async function calculateFileMD5(fileInfo: { filePath: string }) {
    const fileArrayBuffer = await getFileContent({
      encoding: 'binary',
      ...fileInfo,
    })
    const spark = new SparkMD5.ArrayBuffer()
    spark.append(fileArrayBuffer as ArrayBuffer)
    const md5 = spark.end()
    return md5
  }
}
