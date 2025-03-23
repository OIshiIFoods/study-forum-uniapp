import { useUserMessage } from '@/hooks/useUserMessage'
import { baseURL } from './http'
import MySocket from './modules/socket'

const messageSocket = new MySocket({
  url: baseURL?.replace(/(http)|(https)/, 'ws') + '/message',
  header: {
    Authorization: `Bearer ${uni.getStorageSync('token')}`,
  },
})

const { syncRemoteMessages } = useUserMessage()

messageSocket.registerMessageEvent('message', async (params) => {
  const resData = JSON.parse(params.data)
  if (resData.type === 'syncRemoteMessages') {
    await syncRemoteMessages()
  }
})

export default messageSocket
