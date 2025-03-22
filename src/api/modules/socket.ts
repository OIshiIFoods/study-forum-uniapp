type MessageEventType = (params: UniApp.OnSocketMessageCallbackResult) => void

class MySocket {
  private socket: UniNamespace.SocketTask | undefined
  private messageEvents: Record<string, MessageEventType[]> = {}
  private config: UniNamespace.ConnectSocketOption | undefined

  constructor(params: UniNamespace.ConnectSocketOption) {
    this.config = params
  }

  initial() {
    if (!this.config) {
      console.log('初始化失败')
      return
    }
    const params = this.config
    this.socket = uni.connectSocket({
      success: () => {
        console.log('socket连接成功:', params.url)
      },
      fail: () => {
        console.log('socket连接失败:', params.url)
      },
      ...params,
    })
    this.socket.onMessage((options) => {
      Object.entries(this.messageEvents).forEach(([eventName, callbacks]) => {
        callbacks.forEach((callback) => callback(options))
      })
    })
    this.socket.onClose(() => {
      console.log('socket关闭:', params.url)
      this.close({ code: 1000, reason: '服务器断开连接' })
    })
    this.socket.onOpen(() => {
      console.log('socket打开:', params.url)
    })
    this.socket.onError((err) => {
      console.log('socket错误:', params.url, err)
      this.close({ code: 1000, reason: '服务器断开连接' })
    })
  }

  send(params: UniApp.SendSocketMessageOptions & { data: { type: string } }) {
    if (this.socket) {
      this.socket.send({
        success: () => {
          console.log('发送socket消息成功:', params.data)
        },
        fail: () => {
          console.log('发送socket消息失败:', params.data)
        },
        ...params,
      })
    }
  }

  close(params: UniApp.CloseSocketOptions) {
    if (this.socket) {
      this.socket.close(params)
      this.socket = undefined
      this.messageEvents = {}
    }
  }

  registerMessageEvent(key: string, callback: MessageEventType) {
    if (this.messageEvents[key]) {
      this.messageEvents[key] = []
    }
    this.messageEvents[key].push(callback)
  }

  offNessageEvent(key: string, cb?: MessageEventType) {
    if (cb) {
      const events = this.messageEvents[key]
      events.splice(
        events.findIndex((item) => item === cb),
        1
      )
    } else {
      delete this.messageEvents[key]
    }
  }
}

export default MySocket
