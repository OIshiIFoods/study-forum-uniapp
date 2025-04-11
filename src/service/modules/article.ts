import { request } from '@/api/http'
import type {
  DeleteArticle,
  DeleteArticleComment,
  GetArticleCategories,
  GetArticleCommentList,
  GetArticleDetailInfo,
  GetArticleList,
  PostCollectArticle,
  PostCommentArticle,
  PostLikeArticle,
  PostLikeArticleComment,
  PostPublishArticle,
  PutArticle,
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
    data: {
      ...data,
      orderBy: JSON.stringify(data.orderBy),
    },
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

/** 编辑文章 */
export const updateArticle = async (data: PutArticle.Request) => {
  return request<PutArticle.Response>({
    method: 'PUT',
    url: '/api/v1/article',
    data,
  })
}

/** 删除文章 */
export const deleteArticle = async (data: DeleteArticle.Request) => {
  return request<DeleteArticle.Response>({
    method: 'DELETE',
    url: '/api/v1/article',
    data,
  })
}

/** 点赞文章 */
export const likeArticle = async (data: PostLikeArticle.Request) => {
  return request<PostLikeArticle.Response>({
    method: 'POST',
    url: '/api/v1/article/like',
    data,
  })
}

/** 收藏文章 */
export const collectArticle = async (data: PostCollectArticle.Request) => {
  return request<PostCollectArticle.Response>({
    method: 'POST',
    url: '/api/v1/article/collect',
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

/** 获取评论列表 */
export const getArticleCommentList = async (
  data: GetArticleCommentList.Request
) => {
  return request<GetArticleCommentList.Response>({
    method: 'GET',
    url: '/api/v1/article/comment',
    data,
  })
}

/** 删除评论 */
export const deleteArticleComment = async (
  data: DeleteArticleComment.Request
) => {
  return request<DeleteArticleComment.Response>({
    method: 'DELETE',
    url: '/api/v1/article/comment',
    data,
  })
}

/** 点赞评论 */
export const likeArticleComment = async (
  data: PostLikeArticleComment.Request
) => {
  return request<PostLikeArticleComment.Response>({
    method: 'POST',
    url: '/api/v1/article/comment/like',
    data,
  })
}

/** 获取文章类目列表 */
export const getArticleCategoryList = async (
  data?: GetArticleCategories.Request
) => {
  return request<GetArticleCategories.Response>({
    method: 'GET',
    url: '/api/v1/article/category',
    data,
  })
}
