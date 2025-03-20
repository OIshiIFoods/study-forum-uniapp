class MySocket {
  private socket: UniNamespace.SocketTask | undefined
  private messageEvents: Record<
    string,
    ((result: UniApp.OnSocketMessageCallbackResult) => void)[]
  > = {}

  constructor(params: UniNamespace.ConnectSocketOption) {
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
      this.messageEvents = {}
    }
  }

  registerMessageEvent(
    key: string,
    callback: (result: UniApp.OnSocketMessageCallbackResult) => void
  ) {
    if (this.messageEvents[key]) {
      this.messageEvents[key] = []
    }
    this.messageEvents[key].push(callback)
  }

  offNessageEvent(key: string) {
    delete this.messageEvents[key]
  }
}

export default MySocket
