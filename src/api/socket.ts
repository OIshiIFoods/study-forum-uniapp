import { useUserMessage } from '@/hooks/useUserMessage'
import { baseURL } from './http'
import MySocket from './modules/socket'
import { useNotice } from '@/hooks/useNotice'

const socket = new MySocket({
  url: baseURL!.replace(/(http)|(https)/, 'ws'),
  header: {
    Authorization: `Bearer ${uni.getStorageSync('token')}`,
  },
})

const { syncRemoteMessages } = useUserMessage()
const { addNotice } = useNotice()

socket.registerMessageEvent('message', async (params) => {
  const resData = JSON.parse(params.data)
  if (resData.type === 'syncRemoteMessages') {
    await syncRemoteMessages()
  }
})

socket.registerMessageEvent('notice', async (params) => {
  const resData = JSON.parse(params.data)
  if (resData.type === 'newNotice') {
    addNotice(resData.data?.noticeInfo)
  }
})

export default socket
