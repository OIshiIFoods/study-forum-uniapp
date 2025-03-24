import {
  addArticleComment,
  collectArticle,
  deleteArticle,
  deleteArticleComment,
  getArticleCommentList,
  getArticleDetailInfo,
  getArticleList,
  likeArticle,
  likeArticleComment,
  publishArticle,
  updateArticle,
} from './modules/article'
import { getFileIconConfig } from './modules/common'
import {
  deleteMsgs,
  getChatedUserInfoList,
  getMessageList,
  sendMsg,
} from './modules/message'
import { deleteNotices, getNoticeList, updateNotice } from './modules/notice'
import { getCaptcha } from './modules/ouath'
import {
  followUser,
  getFollowUserList,
  getUserInfo,
  login,
  putUserInfo,
} from './modules/user'
import {
  copyUserFile,
  createFile,
  deleteFile,
  getFileDownloadUrl,
  getUserFiles,
  updateFileInfo,
} from './modules/userFile'

export {
  getCaptcha,
  login,
  getUserInfo,
  createFile,
  getUserFiles,
  getFileIconConfig,
  getFileDownloadUrl,
  deleteFile,
  updateFileInfo,
  copyUserFile,
  publishArticle,
  getArticleDetailInfo,
  addArticleComment,
  putUserInfo,
  getArticleList,
  getArticleCommentList,
  deleteArticleComment,
  likeArticleComment,
  likeArticle,
  updateArticle,
  collectArticle,
  deleteArticle,
  getFollowUserList,
  followUser,
  getMessageList,
  getChatedUserInfoList,
  sendMsg,
  deleteMsgs,
  getNoticeList,
  deleteNotices,
  updateNotice,
}
