import { getNoticeList, getUsersInfoInNotice } from '@/service'
import type { GetUsersInfoInNotice } from '@/service/types/api'
import type { NoticeProps, UserProps } from '@/service/types/db'
import { reactive } from 'vue'

const notices = reactive<
  (Omit<NoticeProps, 'content'> & { content: Record<string, any> })[]
>([])
const usersInfoInNotice = reactive<{
  [key: string]: GetUsersInfoInNotice.Response['data']['userInfoList'][0]
}>({})

export const useNotice = () => {
  const init = async () => {
    await syncRemoteNotices()
  }
  /** 同步远程通知信息 */
  const syncRemoteNotices = async () => {
    const getMsgListRes = await getNoticeList()
    await addNotice(getMsgListRes.data.noticeList)
  }

  /** 添加通知 */
  const addNotice = async (newNotices: NoticeProps[]) => {
    const unknownUserIds: number[] = []
    const formatedNotices = newNotices.map(({ content, ...otherInfo }) => {
      if (!usersInfoInNotice[otherInfo.senderId]) {
        unknownUserIds.push(otherInfo.senderId)
      }
      return {
        ...otherInfo,
        content: JSON.parse(content),
      }
    })
    notices.push(...formatedNotices)
    await addUserInfoInNotice(unknownUserIds)
  }

  /** 添加通知关联用户的信息 */
  /** 添加通知中的用户信息 */
  const addUserInfoInNotice = async (userIds: number[]) => {
    if (!userIds.length) {
      return
    }
    const getUserInfoListRes = await getUsersInfoInNotice({
      userIdList: userIds,
    })
    getUserInfoListRes.data.userInfoList.forEach((item) => {
      usersInfoInNotice[item.id] = item
    })
  }

  return {
    notices,
    usersInfoInNotice,
    init,
    syncRemoteNotices,
    addNotice,
    addUserInfoInNotice,
  }
}
