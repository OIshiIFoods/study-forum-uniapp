import { request } from '@/api/http'
import type {
  GetArticleDetailInfo,
  GetArticleList,
  PostCommentArticle,
  PostPublishArticle,
} from '../types/api'

/** 发布文章 */
export const publishArticle = async (data: PostPublishArticle.Request) => {
  return request<PostPublishArticle.Response>({
    method: 'POST',
    url: '/api/v1/article',
    data,
  })
}

/** 获取文章列表 */
export const getArticleList = async (data: GetArticleList.Request) => {
  return request<GetArticleList.Response>({
    method: 'GET',
    url: '/api/v1/article/list',
    data,
  })
}

/** 获取文章详细信息 */
export const getArticleDetailInfo = async (
  data: GetArticleDetailInfo.Request
) => {
  return request<GetArticleDetailInfo.Response>({
    method: 'GET',
    url: '/api/v1/article/detail',
    data,
  })
}

/** 评论文章 */
export const addArticleComment = (params: PostCommentArticle.Request) => {
  return request<PostCommentArticle.Response>({
    method: 'POST',
    url: '/api/v1/article/comment',
    data: params,
  })
}
