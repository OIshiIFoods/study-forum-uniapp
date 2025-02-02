import { request } from '@/api/http'

/** 获取文件图标配置 */
export const getFileIconConfig = async () => {
  return request({
    url: '/api/v1/public/json/fileIconConfig.json',
    method: 'GET',
  })
}
