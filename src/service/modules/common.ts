import { baseURL, request } from '@/api/http'

/** 获取文件图标配置 */
export const getFileIconConfig = async () => {
  return request({
    url: '/api/v1/public/json/fileIconConfig.json',
    method: 'GET',
  })
}

/** 获取轮播图列表 */
export const getSwiperList = async () => {
  const data = await request<{ id: number; url: string; articleId?: number }[]>(
    {
      url: '/api/v1/public/json/swiperConfig.json',
      method: 'GET',
    }
  )
  return data.map(({ id, url, articleId }) => ({
    id,
    url: baseURL! + url,
    articleId,
  }))
}
