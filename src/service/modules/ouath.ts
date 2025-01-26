import { request } from '@/api/http'
import type { PostOauthCaptcha, PostUserLogin } from '../types/api'

/** 获取验证码 */
export const getCaptcha = async (data: PostOauthCaptcha.Request) => {
  return request<PostOauthCaptcha.Response>({
    method: 'POST',
    url: '/api/v1/oauth/captcha',
    data,
  })
}
