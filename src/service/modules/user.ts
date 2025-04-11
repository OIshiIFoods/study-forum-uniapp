import { request } from '@/api/http'
import type {
  GetFollowUserList,
  GetUserInfo,
  PostFollowUser,
  PostUserLogin,
  PutUserInfo,
  PostBlacklistUser,
  DeleteBlacklistUser,
  GetBlacklist,
  PostReportRecord,
  GetReportRecordCount,
} from '../types/api'

/** 登录 */
export const login = async (data: PostUserLogin.Request) => {
  return request<PostUserLogin.Response>({
    method: 'POST',
    url: '/api/v1/user/login',
    data,
  })
}

/** 获取用户基本信息 */
export const getUserInfo = async (params?: GetUserInfo.Request) => {
  return request<GetUserInfo.Response>({
    method: 'GET',
    url: '/api/v1/user',
    data: params,
  })
}

/** 修改用户信息 */
export const putUserInfo = async (params: PutUserInfo.Request) => {
  return request<PutUserInfo.Response>({
    method: 'PUT',
    url: '/api/v1/user',
    data: params,
  })
}

/** 关注用户 */
export const followUser = async (params: PostFollowUser.Request) => {
  return request<PostFollowUser.Response>({
    method: 'POST',
    url: '/api/v1/user/follow',
    data: params,
  })
}

/** 获取用户关注列表 */
export const getFollowUserList = async (params?: GetFollowUserList.Request) => {
  return request<GetFollowUserList.Response>({
    method: 'GET',
    url: '/api/v1/user/follow',
    data: params,
  })
}

/** 拉黑用户 */
export const blockUser = async (data: PostBlacklistUser.Request) => {
  return request<PostBlacklistUser.Response>({
    method: 'POST',
    url: '/api/v1/user/blacklist',
    data,
  })
}

/** 取消拉黑用户 */
export const unblockUser = async (data: DeleteBlacklistUser.Request) => {
  return request<DeleteBlacklistUser.Response>({
    method: 'DELETE',
    url: '/api/v1/user/blacklist',
    data,
  })
}

/** 获取拉黑的用户列表 */
export const getBlacklist = async () => {
  return request<GetBlacklist.Response>({
    method: 'GET',
    url: '/api/v1/user/blacklist',
  })
}

/** 举报投诉 */
export const report = async (data: PostReportRecord.Request) => {
  return request<PostReportRecord.Response>({
    method: 'POST',
    url: '/api/v1/user/reportRecord',
    data,
  })
}

/** 获取投诉举报数量 */
export const getReportReordCount = async (data:GetReportRecordCount.Request) => {
  return request<GetReportRecordCount.Response>({
    method: 'GET',
    url: '/api/v1/user/reportCount',
    data
  })
}
