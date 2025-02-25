import {
  addArticleComment,
  getArticleDetailInfo,
  getArticleList,
  publishArticle,
} from './modules/article'
import { getFileIconConfig } from './modules/common'
import { getCaptcha } from './modules/ouath'
import { getUserInfo, login, putUserInfo } from './modules/user'
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
}
