import { request } from '@/api/http'
import type { GetFileList, PostAddUserFile } from '../types/api'

/** 创建文件 */
export const createFile = async (data: PostAddUserFile.Request) => {
  return request<PostAddUserFile.Response>({
    method: 'POST',
    url: '/api/v1/file/add',
    data,
  })
}

/** 获取用户文件列表 */
export const getUserFiles = async (data: GetFileList.Request) => {
  return request<GetFileList.Response>({
    method: 'GET',
    url: '/api/v1/file',
    data,
  })
}
