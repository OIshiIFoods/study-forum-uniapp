import { request } from '@/api/http'
import type { GetUserInfo, PostUserLogin, PutUserInfo } from '../types/api'

/** 登录 */
export const login = async (data: PostUserLogin.Request) => {
  return request<PostUserLogin.Response>({
    method: 'POST',
    url: '/api/v1/user/login',
    data,
  })
}

export const getUserInfo = async (params?: GetUserInfo.Request) => {
  return request<GetUserInfo.Response>({
    method: 'GET',
    url: '/api/v1/user',
  })
}

/** 修改用户信息 */
export const putUserInfo = async (params?: PutUserInfo.Request) => {
  return request<PutUserInfo.Response>({
    method: 'PUT',
    url: '/api/v1/user',
    data: params,
  })
}
