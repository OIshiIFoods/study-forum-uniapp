import { getNoticeList } from '@/service'
import type { NoticeProps } from '@/service/types/db'
import { ref } from 'vue'

const notices = ref<NoticeProps[]>([])

export const useNotice = () => {
  const init = async () => {
    await syncRemoteNotices()
  }
  /** 同步远程通知信息 */
  const syncRemoteNotices = async () => {
    const getMsgListRes = await getNoticeList()
    const noticeList = getMsgListRes.data.noticeList
    notices.value = noticeList
  }

  /** 添加通知 */
  const addNotice = (notice: NoticeProps) => {
    notices.value.unshift(notice)
  }

  return {
    init,
    addNotice,
    syncRemoteNotices,
  }
}
