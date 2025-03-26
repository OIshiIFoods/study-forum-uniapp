import {
  ArticleCommentProps,
  ArticleProps,
  FileStatusEnum,
  FollowProps,
  UserFileProps,
  UserProps,
  UserMessageProps,
} from './db'

/** 排序条件 */
export type OrderByOption<FieldnameType extends string = string> = {
  /** 字段名称 */
  field: FieldnameType
  /** 排序方向 */
  direction: 'ASC' | 'DESC'
}

/** 用户登录 */
export namespace PostUserLogin {
  type Request = {
    /** 验证码 */
    captcha: string
    /** 手机号 */
    phoneNumber: string
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      /** token */
      token: string
    }
  }
}

/** 获取用户信息 */
export namespace GetUserInfo {
  type Request = {
    userId?: number
  }
  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: UserProps & {
      followList: GetFollowUserList.Response['data']['followList']
    }
  }
}

/** 修改用户信息 */
export namespace PutUserInfo {
  type Request = {
    /** 头像链接 */
    avatarLink?: string
    /** 生日 */
    birthday?: string
    /** 昵称 */
    nickname?: string
    /** 性别 */
    sex?: number
    /** 签名 */
    signature?: string
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      userInfo: UserProps
    }
  }
}

/** 关注用户 */
export namespace PostFollowUser {
  type Request = {
    /** 关注用户id */
    followedUserId: number
    /** 是否关注 */
    isFollow: boolean
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 获取用户关注列表 */
export namespace GetFollowUserList {
  type Request = {
    type: 'follow' | 'fans' | 'mutual'
  }
  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      /** 用户列表 */
      followList: (Pick<FollowProps, 'id' | 'createTime'> & {
        userId: number
        /** 是否互关 */
        isMutual: 0 | 1
        /** 被关注用户昵称 */
        userNickname: string
        /** 被关注用户头像链接 */
        userAvatarLink: string
      })[]
    }
  }
}

/** 上传文件 */
export namespace PostUploadFile {
  type Request = {
    /** 文件 */
    files: File[]
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      uploadFileInfoList: {
        /** 文件保存的文件名 */
        filename: string
        /** 原始文件名 */
        originalname: string
        /** 编码方式 */
        encoding: string
        /** MIME 类型 */
        mimetype: string
        /** 文件大小（字节） */
        size: number
        /** 文件链接 */
        url: string
      }[]
    }
  }
}

/** 验证码校验 */
export namespace PostOauthCaptcha {
  type Request = {
    /** 手机号 */
    phoneNumber: string
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      /** 有效时长 */
      effectiveDuration: number
    }
  }
}

/** 添加用户文件 */
export namespace PostAddUserFile {
  type DirBaseInfo = {
    /** 父级路径 */
    parentPath: string
    /** 文件名称 */
    filename: string
    /** 访问权限[0:私有, 1公共]  */
    accessPermissions: 0 | 1
    /** 是否为目录 */
    isDir: 1
  }

  type FileBaseInfo = {
    /** 父级路径 */
    parentPath: string
    /** 文件名称 */
    filename: string
    /** 访问权限[0:私有, 1公共]  */
    accessPermissions: 0 | 1
    /** 是否为目录 */
    isDir: 0
    /** 原始文件名称 */
    originalname: string
    /** 文件类型 */
    mimetype: string
    /** 文件大小 */
    size: number
  }

  type Request = (DirBaseInfo | FileBaseInfo)[]

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 复制用户文件 */
export namespace PostCopyUserFile {
  type Request = {
    /** 要被复制的文件id列表 */
    copiedFileIdList: number[]
    /** 存储路径 */
    savePath: string
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 获取文件列表 */
export namespace GetFileList {
  type Request = Pick<Partial<UserFileProps>, 'parentPath' | 'status'> & {
    /** 文件全名 */
    fullname?: string
    /** 排序字段 */
    orderBy?: string
    /** 文件id列表 */
    fileIds?: number[]
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    /** 响应数据 */
    data: {
      /** 文件信息列表 */
      fileInfoList: UserFileProps[]
    }
  }
}

/** 修改用户文件信息 */
export namespace PutUserFileInfo {
  type Request = (Pick<UserFileProps, 'id'> &
    Partial<
      Omit<
        UserFileProps,
        | 'id'
        | 'userId'
        | 'createTime'
        | 'updateTime'
        | 'deleteTime'
        | 'isDir'
        | 'originFileId'
      >
    >)[]

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 删除用户文件 */
export namespace DeleteUserFile {
  type Request = {
    /** 文件id列表 */
    fileIdList: number[]
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 创建文件下载链接 */
export namespace PostFileDownloadLink {
  type Request = {
    /** 文件id列表 */
    fileIdList: number[]
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      /** 下载链接 */
      downloadLink: string
      /** 有效时间 */
      effectiveDuration: number
    }
  }
}

/** 发布文章 */
export namespace PostPublishArticle {
  type Request = {
    /** 标题 */
    title: string
    /** 内容 */
    content: string
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      /** 文章id */
      id: number
    }
  }
}

/** 删除文章 */
export namespace DeleteArticle {
  type Request = {
    /** 文章id列表 */
    articleIdList: number[]
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 修改文章 */
export namespace PutArticle {
  type Request = {
    /** 文章id */
    articleId: number
    /** 标题 */
    title: string
    /** 内容 */
    content: string
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 获取文章详细信息 */
export namespace GetArticleDetailInfo {
  type Request = {
    /** 文章id */
    articleId: number
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      /** 文章信息 */
      articleInfo: Omit<ArticleProps, 'userId'> & {
        likedUsers: number[]
        collectedUsers: number[]
      }
      /** 用户信息 */
      userInfo: Pick<ArticleProps, 'userId'> &
        Pick<UserProps, 'nickname' | 'avatarLink'>
      /** 评论列表 */
      commentList: (ArticleCommentProps &
        Pick<UserProps, 'nickname' | 'avatarLink'>)[]
    }
  }
}

/** 获取文章列表 */
export namespace GetArticleList {
  type Request = Partial<
    Omit<ArticleProps, 'deleteTime' | 'updateTime' | 'createTime'>
  > & {
    isLiked?: 1 | 0
    isCollected?: 1 | 0
    limit?: number
    deleteTime?: [string, string]
    updateTime?: [string, string]
    createTime?: [string, string]
    orderBy?: OrderByOption<keyof ArticleProps>[]
  }
  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      /** 文章列表 */
      articleList: (ArticleProps & Pick<UserProps, 'nickname' | 'avatarLink'>)[]
    }
  }
}

/** 点赞文章 */
export namespace PostLikeArticle {
  type Request = {
    /** 文章id */
    articleId: number
    /** 点赞状态 */
    isLiked: 1 | 0
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 收藏文章 */
export namespace PostCollectArticle {
  type Request = {
    /** 文章id */
    articleId: number
    /** 收藏状态 */
    isCollected: 1 | 0
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 评论文章 */
export namespace PostCommentArticle {
  type Request = {
    /** 文章id */
    articleId: number
    /** 评论内容 */
    content: string
    /** 父级评论id */
    parentCommentId?: number
    /** 回复目标评论id */
    toCommentId?: number
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 删除文章评论 */
export namespace DeleteArticleComment {
  type Request = {
    /** 评论id */
    commentIdList: number[]
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 获取文章评论列表 */
export namespace GetArticleCommentList {
  type Request = {
    /** 文章id */
    articleId?: number
    /** 评论id */
    commentId?: number
    /** 父级评论的 ID */
    parentCommentId?: number
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      /** 评论列表 */
      commentList: (ArticleCommentProps &
        Pick<UserProps, 'nickname' | 'avatarLink'>)[]
    }
  }
}

/** 给文章评论点赞 */
namespace PostLikeArticleComment {
  export type Request = {
    /** 评论ID */
    commentId: number
  }

  export type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 获取消息列表 */
export namespace GetMessageList {
  type Request = {
    /** 是否已读 */
    isRead: '0' | '1'
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      /** 消息列表 */
      messages: UserMessageProps[]
    }
  }
}

/** 获取交流的的用户信息列表 */
export namespace GetchatedUsersInfo {
  type Request = {
    userIdList: number[]
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      userInfoList: Pick<UserProps, 'id' | 'nickname' | 'avatarLink'>[]
    }
  }
}

/** 发送消息 */
export namespace PostSendMessage {
  type Request = {
    /** 接收者ID */
    receiverId: number
    /** 消息内容 */
    content: string
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: { sendMsg: UserMessageProps }
  }
}

/** 删除消息 */
export namespace DeleteMessages {
  type Request = {
    /** 消息ID列表 */
    messageIdList: number[]
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 获取通知列表 */
export namespace GetNoticeList {
  type Request = {
    isRead?: '0' | '1'
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      noticeList: NoticeProps[]
    }
  }
}

/** 更新通知信息 */
export namespace UpdateNoticeInfo {
  type Request = {
    /** 通知id */
    noticeId: number
    /** 是否已读 */
    isRead: boolean
  }[]

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

/** 删除通知消息 */
export namespace DeleteNotices {
  type Request = {
    /** 通知id列表 */
    noticeIdList: number[]
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: any
  }
}

export namespace GetUsersInfoInNotice {
  type Request = {
    userIdList: number[]
  }

  type Response = {
    /** 状态码 */
    status: number
    /** 响应信息 */
    message: string
    data: {
      userInfoList: Pick<UserProps, 'id' | 'nickname' | 'avatarLink'>[]
    }
  }
}
