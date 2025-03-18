import { baseURL, request } from '@/api/http'
import type {
  DeleteMessages,
  GetchatedUsersInfo,
  GetMessageList,
  PostSendMessage,
} from '../types/api'

/** 获取消息列表 */
export const getMessageList = async (params: GetMessageList.Request) => {
  const res = await request<GetMessageList.Response>({
    url: '/api/v1/message/list',
    method: 'GET',
    data: params,
  })
  // 如果是要获取未读消息，则删除远程存储的未读消息
  if (params.isRead === '0') {
    await deleteMsgs({
      messageIdList: res.data.messages.map((item) => item.id),
    })
  }
  return res
}

/** 获取交流的的用户信息列表 */
export const getChatedUserInfoList = async (
  params: GetchatedUsersInfo.Request
) => {
  return await request<GetchatedUsersInfo.Response>({
    url: '/api/v1/message/chatedUsersInfo',
    method: 'GET',
    data: params,
  })
}

/** 发送消息 */
export const sendMsg = async (params: PostSendMessage.Request) => {
  return await request<PostSendMessage.Response>({
    url: '/api/v1/message/send',
    method: 'POST',
    data: params,
  })
}

/** 删除消息 */
export const deleteMsgs = async (params: DeleteMessages.Request) => {
  return await request<DeleteMessages.Response>({
    url: '/api/v1/message/delete',
    method: 'DELETE',
    data: params,
  })
}
