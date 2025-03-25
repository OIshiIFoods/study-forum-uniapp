import { request } from '@/api/http'
import type {
  DeleteNotices,
  GetNoticeList,
  GetUsersInfoInNotice,
  UpdateNoticeInfo,
} from '../types/api'

/** 获取消息列表 */
export const getNoticeList = async (params?: GetNoticeList.Request) => {
  const res = await request<GetNoticeList.Response>({
    url: '/api/v1/notice/list',
    method: 'GET',
    data: params,
  })
  return res
}

/** 删除通知 */
export const deleteNotices = async (params: DeleteNotices.Request) => {
  return await request<DeleteNotices.Response>({
    url: '/api/v1/notice/delete',
    method: 'DELETE',
    data: params,
  })
}

/** 更新通知 */
export const updateNotice = async (params: UpdateNoticeInfo.Request) => {
  return await request<UpdateNoticeInfo.Response>({
    url: '/api/v1/notice/update',
    method: 'PUT',
    data: params,
  })
}

/** 获取与通知相关的用户信息 */
export const getUsersInfoInNotice = async (
  params: GetUsersInfoInNotice.Request
) => {
  return await request<GetUsersInfoInNotice.Response>({
    url: '/api/v1/notice/usersInfo',
    method: 'GET',
    data: params,
  })
}
