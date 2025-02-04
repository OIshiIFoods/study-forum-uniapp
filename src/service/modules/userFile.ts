import { request } from '@/api/http'
import type {
  DeleteUserFile,
  GetFileList,
  PostAddUserFile,
  PostFileDownloadLink,
} from '../types/api'

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

/** 获取文件下载链接 */
export const getFileDownloadUrl = async (
  data: PostFileDownloadLink.Request
) => {
  return request<PostFileDownloadLink.Response>({
    method: 'POST',
    url: '/api/v1/file/downloadLink',
    data,
  })
}

/** 删除文件 */
export const deleteFile = async (data: DeleteUserFile.Request) => {
  return request<DeleteUserFile.Response>({
    method: 'DELETE',
    url: '/api/v1/file',
    data,
  })
}
