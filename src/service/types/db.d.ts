/** 空间开放状态枚举 */
export enum SpaceOpenStatusEnum {
  Open = 1,
  Close = 0,
}

/** 文件状态枚举 */
export enum FileStatusEnum {
  RecycleBin = 0,
  Normal = 1,
}

/** 文件访问权限枚举 */
export enum FileAccessPermissionsEnum {
  Private = 0,
  Public = 1,
}

/** 通知类型枚举 */
export enum NoticeTypeEnum {
  /** 文章被点赞通知 */
  ArticleLiked = 1,
  /** 文章被收藏通知 */
  ArticleCollected = 2,
  /** 评论被点赞通知 */
  CommentLiked = 3,
  /** 评论被回复通知 */
  CommentReplied = 4,
  /** 评论被@通知 */
  CommentMentioned = 5,
  /** 被关注通知 */
  Followed = 6,
}

/** 文章状态枚举 */
export enum ArticleStatusEnum {
  /** 草稿 */
  Draft = 0,
  /** 仅自己可见 */
  OnlyMe = 1,
  /** 公开 */
  Public = 2,
}

/** 执行增删改mysql语句后返回的对象 */
export interface MysqlOkPacket {
  /** 结果集中字段的数量 */
  fieldCount: number
  /** 受SQL语句影响的行数 */
  affectedRows: number
  /** 第一个插入行的自增ID */
  insertId: number
  /** 服务器的状态标志 */
  serverStatus: number
  /** 执行SQL语句时产生的警告数量 */
  warningCount: number
  /** 关于操作的附加信息 */
  message: string
  /** 是否使用了MySQL 4.1及更高版本的协议 */
  protocol41: boolean
  /** 实际被更改的行数 */
  changedRows: number
}

/** 执行mysql语句失败后返回的对象 */
export interface MySqlError {
  /** 错误代码 */
  code: string
  /** 错误编号 */
  errno: number
  /** SQL 错误消息 */
  sqlMessage: string
  /** SQL 状态码 */
  sqlState: string
  /** 错误索引 */
  index: number
  /** 导致错误的 SQL 语句 */
  sql: string
}

/** 数据库用户表字段信息 */
export interface UserProps {
  /** 用户id */
  id: number
  /** 手机号 */
  phoneNumber: string
  /** 用户昵称 */
  nickname: string
  /** 注册日期 */
  registerDate?: string
  /** 签名 */
  signature: string
  /** 头像链接 */
  avatarLink: string
  /** 性别，[0:保密,1:男, 2女] */
  sex?: 0 | 1 | 2
  /** 生日 */
  birthday?: string
  /** 空间开放状态 */
  spaceOpenStatus: SpaceOpenStatusEnum
  /** 可使用空间大小 字节*/
  availableSpaceSize: number
  /** 已使用空间大小 字节*/
  usedSpaceSize: number
  /** 文章数量 */
  articleCount: number
  /** 关注数量 */
  followCount: number
  /** 粉丝数量 */
  fansCount: number
  /** 点赞的文章数量 */
  likeCount: number
  /** 收藏的文章数量 */
  collectionCount: number
}

/** 数据库 file 表字段信息 */
export interface FileProps {
  /** 文件id */
  id: number
  /** 保存路径 */
  savePath: string
  /** 源文件名称 */
  name: string
  /** 文件类型 */
  type: string
  /** 文件大小 字节*/
  size: number
  /** 引用数量 */
  quoteCount: number
  /** 存储时间 */
  saveTime: string
  /** 上传文件的用户id */
  userId: number
}

/** 数据库 UserFile 表字段信息 */
export interface UserFileProps {
  /** 用户文件id */
  id: number
  /** 用户id */
  userId: number
  /** 文件名称 */
  name: string
  /** 文件类型 */
  type?: string
  /** 父级路径 */
  parentPath: string
  /** 文件状态 */
  status: FileStatusEnum
  /** 文件创建时间 */
  createTime: string
  /** 文件更新时间 */
  updateTime: string
  /** 文件删除时间（为空时代表未删除） */
  deleteTime?: string
  /** 是否为目录 0否1是 */
  isDir: 0 | 1
  /** 访问权限 0 私有 1公共*/
  accessPermissions: FileAccessPermissionsEnum
  /** 源文件id */
  originFileId?: number
}

/** 数据库 Article 表字段信息 */
export interface ArticleProps {
  /** 文章ID */
  id: number
  /** 用户ID */
  userId: number
  /** 标题 */
  title: string
  /** 正文内容 */
  content: string
  /** 点赞数量 */
  likeCount: number
  /** 评论数量 */
  commentCount: number
  /** 收藏数量 */
  collectionCount: number
  /** 浏览量 */
  viewCount: number
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 删除时间（为空时代表未删除） */
  deleteTime?: string
  /** 文章状态 */
  status?: ArticleStatusEnum
  /** 分类ID */
  categoryId?: number
}

/** 数据库 article_like 表字段信息 */
export interface ArticleLikeProps {
  /** id */
  id: number
  /** 用户ID */
  userId: number
  /** 文章ID */
  articleId: number
  /** 点赞时间 */
  createTime: string
}

/** 数据库 article_collection 表字段信息 */
export interface ArticleCollectionProps {
  /** id */
  id: number
  /** 用户ID */
  userId: number
  /** 文章ID */
  articleId: number
  /** 点赞时间 */
  createTime: string
}

/** 数据库 follow 表的字段信息 */
export interface FollowProps {
  /** id */
  id: number
  /** 用户ID */
  userId: number
  /** 关注用户ID */
  followedUserId: number
  /** 关注时间 */
  createTime: string
}

/** 数据库文章评论表的属性 */
export interface ArticleCommentProps {
  /** 评论的唯一标识符 */
  id: number
  /** 评论内容 */
  content: string
  /** 评论创建时间 */
  createTime: string
  /** 评论更新时间 */
  updateTime: string
  /** 父级评论的 ID */
  parentCommentId: number | null
  /** 回复目标评论的 ID */
  toCommentId: number | null
  /** 发表评论的用户 ID */
  userId: number
  /** 文章 ID */
  articleId: number
  /** 点赞的用户列表 */
  likedUserList: string
}

/** 数据库用户消息表的属性 */
export interface UserMessageProps {
  /** 消息的唯一标识符 */
  id: number
  /** 发送者id */
  senderId: number
  /** 接收者id */
  receiverId: number
  /** 消息内容 */
  content: string
  /** 消息创建时间 */
  createTime: string
  /** 消息更新时间 */
  updateTime: string
  /** 消息删除时间 */
  deleteTime?: string
  /** 是否已读 */
  isRead: 1 | 0
}

/** 数据库通知表的属性 */
export interface NoticeProps {
  /** 通知id */
  id: number
  /** 发送通知的用户id */
  senderId: number
  /** 接收通知的用户id */
  receiverId: number
  /** 通知内容 */
  content: string
  /** 通知类型 */
  noticeType: NoticeTypeEnum
  /** 是否已读 */
  isRead: boolean
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 删除时间 */
  deleteTime?: string | null
}

/** 数据库用户黑名单表的属性 */
export interface UserBlacklistProps {
  /** 主键ID */
  id: number
  /** 用户ID(执行屏蔽的用户) */
  userId: number
  /** 被屏蔽用户ID */
  blockedUserId: number
  /** 屏蔽原因 */
  reason?: string
  /** 创建时间 */
  createdTime: string
  /** 更新时间 */
  updatedTime: string
  /** 删除时间 */
  deletedTime?: string | null
}

/** 数据库文章分类表的属性 */
export interface ArticleCategoryProps {
  /** 分类ID */
  id: number
  /** 分类名称 */
  name: string
  /** 分类描述 */
  description?: string
  /** 创建时间 */
  createdTime: string
  /** 更新时间 */
  updatedTime: string
  /** 删除时间 */
  deletedTime?: string | null
}

/** 举报投诉表字段信息 */
export interface ReportRecordProps {
  /** 举报ID */
  id: number
  /** 举报用户ID */
  userId: number
  /** 被举报的文章或文件ID */
  targetId: number
  /** 举报目标类型（文章或文件） */
  targetType: 'article' | 'file'
  /** 举报原因 */
  reason: string
  /** 举报时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 删除时间 */
  deleteTime?: string
}
