import {
  deleteMsgs,
  getChatedUserInfoList,
  getMessageList,
  sendMsg,
} from '@/service'
import type { GetchatedUsersInfo } from '@/service/types/api'
import type { UserMessageProps } from '@/service/types/db'
import { useUserStore } from '@/stores'
import { reactive, watch } from 'vue'

/** 信息列表 */
const messages = reactive<{ [key: string]: UserMessageProps[] }>({} as any)
/** 用户信息 */
const userInfos = reactive<{
  [key: string]: GetchatedUsersInfo.Response['data']['userInfoList'][0]
}>({})

export const useUserMessage = () => {
  const userStore = useUserStore()

  const initData = async () => {
    // 补充本地存储的聊天记录对应的用户信息
    await addUserInfo([
      ...Object.keys(
        JSON.parse(uni.getStorageSync(userStore.id + 'message') || '{}')
      ).map(Number),
      userStore.id!,
    ])
    // 同步本地聊天信息
    Object.assign(
      messages,
      JSON.parse(uni.getStorageSync(userStore.id + 'message') || '{}')
    )
    // 同步未读聊天信息
    const getMsgListRes = await getMessageList({ isRead: '0' })
    const msgList = getMsgListRes.data.messages
    await addMessage(msgList)
    await updateReadStatus(
      msgList[0]?.senderId,
      msgList.map(({ id }) => id)
    )
  }

  /** 发送信息 */
  const sendMessage = async (receiverId: number, content: string) => {
    const newMsg = await sendMsg({ receiverId, content })
    await addMessage([newMsg.data['sendMsg']])
  }

  /** 添加信息 */
  const addMessage = async (messageList: UserMessageProps[]) => {
    if (!messageList.length) {
      return
    }
    const unknowUserIds: number[] = []
    messageList.forEach((item) => {
      const userId =
        item.receiverId === userStore.id ? item.senderId : item.receiverId
      if (messages[userId]) {
        messages[userId].push(item)
      } else {
        messages[userId] = [item]
      }
      if (!userInfos[userId]) {
        unknowUserIds.push(userId)
      }
    })
    // 排序消息列表
    Object.values(messages).forEach((item) => {
      item.sort((a, b) => {
        return +b.createTime - +a.createTime
      })
    })
    // 更新用户信息列表
    addUserInfo(unknowUserIds)
  }

  /** 更改已读状态 */
  const updateReadStatus = async (
    senderId: number,
    messageIdList: number[]
  ) => {
    if (!messageIdList.length) {
      return
    }
    await deleteMsgs({ messageIdList })
    messages[senderId].forEach((item) => {
      messageIdList.includes(item.id) && (item.isRead = 1)
    })
  }

  /** 添加沟通的用户信息 */
  const addUserInfo = async (userIds: number[]) => {
    console.log(userIds)
    if (!userIds.length) {
      return
    }
    const getUserInfoListRes = await getChatedUserInfoList({
      userIdList: userIds,
    })
    getUserInfoListRes.data.userInfoList.forEach((item) => {
      userInfos[item.id] = item
    })
  }

  watch(messages, (newVal) => {
    uni.setStorageSync(userStore.id + 'message', JSON.stringify(newVal))
  })

  return {
    messages,
    userInfos,
    initData,
    addMessage,
    addUserInfo,
    sendMessage,
    updateReadStatus,
  }
}
