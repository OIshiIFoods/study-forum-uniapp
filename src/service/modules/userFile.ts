import { request } from '@/api/http'
import mime from 'mime-types'
import type {
  DeleteUserFile,
  GetFileList,
  PostAddUserFile,
  PostCopyUserFile,
  PostFileDownloadLink,
  PutUserFileInfo,
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
export const getUserFiles = async ({
  orderBy,
  ...otherParams
}: Omit<GetFileList.Request, 'orderBy'> & {
  orderBy?: {
    /** 字段名称 */
    field: string
    /** 排序方向 */
    direction: 'ASC' | 'DESC'
  }[]
}) => {
  const res = await request<GetFileList.Response>({
    method: 'GET',
    url: '/api/v1/file',
    data: {
      orderBy: JSON.stringify(orderBy),
      ...otherParams,
    },
  })
  const newFileInfoList =
    res.data?.fileInfoList && Array.isArray(res.data?.fileInfoList)
      ? res.data?.fileInfoList.map((item) => ({
          fullname:
            item.name + (item.type ? '.' + mime.extension(item.type) : ''),
          ...item,
        }))
      : []
  return {
    ...res,
    data: {
      ...res.data,
      fileInfoList: newFileInfoList,
    },
  }
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

/** 修改文件信息 */
export const updateFileInfo = async (data: PutUserFileInfo.Request) => {
  return request<PutUserFileInfo.Response>({
    method: 'PUT',
    url: '/api/v1/file',
    data,
  })
}

/** 复制文件 */
export const copyUserFile = async (data: PostCopyUserFile.Request) => {
  return request<PostCopyUserFile.Response>({
    method: 'POST',
    url: '/api/v1/file/copy',
    data,
  })
}
