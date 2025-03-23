import { useUserMessage } from '@/hooks/useUserMessage'
import { baseURL } from './http'
import MySocket from './modules/socket'

const messageSocket = new MySocket({
  url: baseURL?.replace(/(http)|(https)/, 'ws') + '/message',
})

const { syncRemoteMessages } = useUserMessage()

messageSocket.registerMessageEvent('message', async (params) => {
  if (params.data.type === 'getUnreadMessage') {
    await syncRemoteMessages()
  }
})

export default messageSocket
