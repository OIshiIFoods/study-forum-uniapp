import { getFileIconConfig } from './modules/common'
import { getCaptcha } from './modules/ouath'
import { getUserInfo, login } from './modules/user'
import {
  createFile,
  getFileDownloadUrl,
  getUserFiles,
} from './modules/userFile'

export {
  getCaptcha,
  login,
  getUserInfo,
  createFile,
  getUserFiles,
  getFileIconConfig,
  getFileDownloadUrl,
}
