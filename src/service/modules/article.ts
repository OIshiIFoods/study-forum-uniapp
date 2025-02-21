import { request } from '@/api/http'
import type { PostPublishArticle } from '../types/api'

/** 登录 */
export const publishArticle = async (data: PostPublishArticle.Request) => {
  return request<PostPublishArticle.Response>({
    method: 'POST',
    url: '/api/v1/article',
    data,
  })
}
