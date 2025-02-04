<template>
  <view class="h-100vh grid grid-rows-[1fr_auto]">
    <view
      class="box-border p-[0_calc(var(--page-side-unit-size)*5)] overflow-auto"
    >
      <!-- 搜索栏 -->
      <up-navbar :title="navbarConfig.title" auto-back placeholder />
      <up-search
        placeholder="搜索文件"
        :height="35"
        :placeholderColor="'var(--text-color-grey)'"
        :showAction="false"
      />
      <!-- 条件区域 -->
      <view class="flex justify-between m-[10px_0]">
        <view class="flex items-center gap-col-8px">
          <view
            class="iconfont icon-refresh"
            @click="curAccessDirInfo.updateLeap = !curAccessDirInfo.updateLeap"
          />
        </view>
        <view class="flex items-center gap-col-8px">
          <view
            class="iconfont icon-filter"
            @click="sortPopupConfig.show = true"
          />
          <up-icon
            :name="viewMode"
            :size="20"
            color="var(--text-color-grey)"
            @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
          />
        </view>
      </view>
      <!-- 文件列表区域 -->
      <up-list v-if="viewMode === 'grid'">
        <up-list-item
          class="overflow-hidden"
          v-for="item in curAccessDirInfo.fileInfoList"
          :key="item.id"
        >
          <up-cell
            :title="item.name"
            :titleStyle="{ color: '#000', fontSize: '14px' }"
            :label="dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss')"
            :border="false"
            @click="handleFileClick(item)"
            @longpress="handleFileLongPress(item)"
          >
            <template #icon>
              <view
                class="w-[40px] p-t-[100%] m-r-10px bg-center bg-contain bg-no-repeat"
                :style="{
                  backgroundImage: `url(${baseURL + '/api/v1/public/images/fileIcons'}/${getFileIconName(item.fullname, !!item.isDir)})`,
                }"
              />
            </template>
            <template #right-icon>
              <view @click.stop="() => {}">
                <view
                  v-if="!curAccessDirInfo.selectedFiles.includes(item.id)"
                  class="w-10px h-10px b-1px b-style-solid b-[#ccc] rounded-full"
                  @click="curAccessDirInfo.selectedFiles.push(item.id)"
                />
                <up-icon
                  v-else
                  name="checkmark-circle-fill"
                  color="#59a3f4"
                  size="20"
                  @click="
                    curAccessDirInfo.selectedFiles =
                      curAccessDirInfo.selectedFiles.filter(
                        (slectItemId) => slectItemId !== item.id
                      )
                  "
                />
              </view>
            </template>
          </up-cell>
        </up-list-item>
      </up-list>
      <view v-else class="flex flex-wrap">
        <view
          class="pos-relative flex flex-col items-center justify-center w-[25%] box-border p-[10px] overflow-hidden"
          v-for="item in curAccessDirInfo.fileInfoList"
          :key="item.id"
          @click="handleFileClick(item)"
          @longpress="handleFileLongPress(item)"
        >
          <view
            class="w-[70%] p-t-[100%] bg-center bg-contain bg-no-repeat"
            :style="{
              backgroundImage: `url(${baseURL + '/api/v1/public/images/fileIcons'}/${getFileIconName(item.fullname, !!item.isDir)})`,
            }"
          />
          <text class="text-[12px]">{{ item.fullname }}</text>
          <view
            class="pos-absolute pos-top-3px pos-right-3px"
            @click.stop="() => {}"
          >
            <view
              v-if="!curAccessDirInfo.selectedFiles.includes(item.id)"
              class="w-10px h-10px b-1px b-style-solid b-[#ccc] rounded-full"
              @click="curAccessDirInfo.selectedFiles.push(item.id)"
            />
            <up-icon
              v-else
              name="checkmark-circle-fill"
              color="#59a3f4"
              size="20"
              @click="
                curAccessDirInfo.selectedFiles =
                  curAccessDirInfo.selectedFiles.filter(
                    (slectItemId) => slectItemId !== item.id
                  )
              "
            />
          </view>
        </view>
      </view>
    </view>
    <!-- 文件弹出框 -->
    <up-popup
      :show="filePopupConfig.show"
      mode="bottom"
      closeable
      @close="filePopupConfig.show = false"
    >
      <view
        class="p-[18px] bg-[linear-gradient(to_bottom,#f6eeca,#f9f8f8_60%)]"
      >
        <view v-for="column in filePopupConfig.content" :key="column.title">
          <view class="text-15px font-700 m-[20px_0]">
            {{ column.title }}
          </view>
          <view class="flex flex-wrap">
            <view
              class="box-border p-[5px] w-25%"
              v-for="item in column.list"
              :key="item.title"
              @click="item.clickAction"
            >
              <view
                class="flex flex-col items-center justify-center bg-white p-[10px_0] rounded-[5px]"
              >
                <view
                  class="iconfont text-[25px] mb-10px"
                  :class="'icon-' + item.iconName"
                  :style="item.style"
                />
                <text class="text-[12px]">{{ item.title }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </up-popup>
    <!-- 排序弹出框 -->
    <up-popup
      :show="sortPopupConfig.show"
      mode="bottom"
      closeable
      @close="sortPopupConfig.show = false"
    >
      <view class="p-[30px_18px]">
        <view
          class="flex items-center p-[10px_0]"
          @click="
            () => {
              curAccessDirInfo.orderBy.push({
                field: 'updateTime',
                direction: 'DESC',
              })
              sortPopupConfig.show = false
            }
          "
        >
          <view class="iconfont icon-time text-[20px] mr-[10px]" />
          <text class="text-[13px] font-700">时间排序</text>
        </view>
      </view>
    </up-popup>
    <!-- 新建文件夹弹出窗 -->
    <up-popup
      :show="createFolderPopupConfig.show"
      mode="center"
      closeable
      @close="createFolderPopupConfig.show = false"
    >
      <view class="p-[40px_16px_12px]">
        <up-form
          ref="createFolderFormRef"
          :model="createFolderPopupConfig.formInfo.model"
          :rules="createFolderPopupConfig.formInfo.rules"
        >
          <up-form-item prop="filename" label="文件夹名称：" :labelWidth="100">
            <up-input
              v-model="createFolderPopupConfig.formInfo.model.filename"
            />
          </up-form-item>
        </up-form>
        <view class="mt-[20px]">
          <up-button type="primary" text="确定" @click="createFolder" />
        </view>
      </view>
    </up-popup>
    <!-- 操作文件弹出窗 -->
    <view
      v-show="operateFilePopupConfig.show"
      class="pos-relative flex flex-wrap p-[25px_10px_10px] b-0 b-t b-solid b-[#ccc] animate-duration-150 animate-keyframes-slide-in-up"
    >
      <up-icon
        name="close"
        class="pos-absolute pos-top-10px pos-right-10px"
        @click="curAccessDirInfo.selectedFiles = []"
      />
      <view
        class="flex flex-col justify-end items-center p-[10px_0] w-20%"
        v-for="item in operateFilePopupConfig.list"
        :key="item.title"
        @click="item.clickAction"
      >
        <view
          class="iconfont text-[18px] mb-[6px]"
          :class="'icon-' + item.iconName"
          :style="item.style"
        />
        <text class="text-[10px] font-700">{{ item.title }}</text>
      </view>
    </view>
    <!-- 文件下载弹出框 -->
    <up-popup
      :show="fileDownloadPopupConfig.show"
      mode="center"
      closeable
      @close="fileDownloadPopupConfig.show = false"
    >
      <view class="flex flex-col p-[40px_18px] w-650 gap-row-2">
        <view class="text-15px">
          以下为下载链接，有效时间为
          <text class="text-[red]">
            {{ fileDownloadPopupConfig.effectiveDuration }}
          </text>
          秒
        </view>
        <text class="text-15px text-[red]">请长按复制后再退出！！！</text>
        <text
          class="text-[12px] break-all text-[#59a3f4]"
          @longpress="copyText(fileDownloadPopupConfig.downloadLink)"
        >
          {{ fileDownloadPopupConfig.downloadLink }}
        </text>
      </view>
    </up-popup>
    <!-- 悬浮按钮 -->
    <view v-show="!operateFilePopupConfig.show">
      <up-float-button
        class="flex"
        bottom="100px"
        right="10px"
        @click="filePopupConfig.show = true"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import router from '@/router'
import {
  createFile,
  getFileDownloadUrl,
  getFileIconConfig,
  getUserFiles,
} from '@/service'
import type { UserFileProps } from '@/service/types/db'
import dayjs from 'dayjs'
import { onMounted, reactive, ref, watch } from 'vue'
import type { _FormRef } from 'uview-plus/types/comps/form'
import { baseURL, uploadFile } from '@/api/http'
import mime from 'mime-types'
import { onLoad } from '@dcloudio/uni-app'
import { deleteFile } from '@/service/modules/userFile'

type OrderByOptions = {
  /** 字段名称 */
  field: string
  /** 排序方向 */
  direction: 'ASC' | 'DESC'
}

const curAccessDirInfo = reactive({
  path: '',
  updateLeap: 1,
  orderBy: [] as OrderByOptions[],
  status: 1,
  fileInfoList: [] as (UserFileProps & { fullname: string })[],
  selectedFiles: [] as number[],
})
// 文件列表视图切换
const viewMode = ref('list')
// 文件弹出框配置
const filePopupConfig = reactive({
  show: false,
  content: [
    {
      title: '上传文件',
      list: [
        {
          title: '微信文件',
          iconName: 'weixin',
          style: { color: '#24db5a' },
          clickAction: () => {
            uni.showLoading({
              title: '上传中',
            })
            uni.chooseMessageFile({
              count: 5,
              success: async (res) => {
                const uploadFileRes = await uploadFile(
                  'file',
                  res.tempFiles.map(({ name, path }) => ({
                    name,
                    filePath: path,
                  }))
                )
                const createRes = await createFile(
                  uploadFileRes.success.map(
                    ({ url, encoding, originalname, ...otherInfo }) => ({
                      parentPath: curAccessDirInfo.path,
                      accessPermissions: 1,
                      isDir: 0,
                      originalname: res.tempFiles
                        .find(({ path }) => path.includes(originalname))
                        ?.name.split('.')[0],
                      ...otherInfo,
                    })
                  )
                )
                uni.hideLoading()
                filePopupConfig.show = false
                curAccessDirInfo.updateLeap = +!curAccessDirInfo.updateLeap
                if (uploadFileRes.fail.length && createRes.status !== 200) {
                  uni.showToast({
                    title: '上传失败',
                    icon: 'none',
                  })
                } else {
                  uni.showToast({
                    title: '上传成功',
                    icon: 'none',
                  })
                }
              },
              fail: (err) => {
                uni.showToast({
                  title: '选择文件失败',
                  icon: 'none',
                })
                uni.hideLoading()
              },
            })
          },
        },
      ],
    },
    {
      title: '新建文件',
      list: [
        {
          title: '新建文件夹',
          iconName: 'simple-folder',
          style: {},
          clickAction: () => {
            filePopupConfig.show = false
            createFolderPopupConfig.show = true
          },
        },
      ],
    },
  ],
})
// 排序弹出框配置
const sortPopupConfig = reactive({
  show: false,
})
// 新建文件夹弹出窗配置
const createFolderFormRef = ref<_FormRef>()
const createFolderPopupConfig = reactive({
  show: false,
  formInfo: {
    model: {
      filename: '',
    },
    rules: {
      filename: {
        type: 'string',
        required: true,
        message: '请输入文件夹名称',
        trigger: ['blur'],
      },
    },
  },
})
// 操作文件弹出窗配置
const operateFilePopupConfig = reactive({
  show: false,
  list: [
    {
      title: '下载',
      iconName: 'download',
      style: {},
      clickAction: async () => {
        const { data } = await getFileDownloadUrl({
          fileIdList: curAccessDirInfo.selectedFiles,
        })
        Object.assign(fileDownloadPopupConfig, {
          show: true,
          ...data,
        })
        curAccessDirInfo.selectedFiles = []
      },
    },
    {
      title: '分享',
      iconName: 'share',
      style: {},
      clickAction: () => {
        curAccessDirInfo.selectedFiles = []
      },
    },
    {
      title: '删除',
      iconName: 'delete',
      style: {},
      clickAction: async () => {
        await deleteFile({
          fileIdList: curAccessDirInfo.selectedFiles,
        })
        uni.showToast({ title: '删除成功', icon: 'none' })
        curAccessDirInfo.selectedFiles = []
        curAccessDirInfo.updateLeap = +!curAccessDirInfo.updateLeap
      },
    },
    {
      title: '复制',
      iconName: 'copy',
      style: { fontSize: '23px' },
      clickAction: () => {
        curAccessDirInfo.selectedFiles = []
      },
    },
    {
      title: '移动',
      iconName: 'move',
      style: {},
      clickAction: () => {
        curAccessDirInfo.selectedFiles = []
      },
    },
    {
      title: '重命名',
      iconName: 'rename',
      style: { fontSize: '18px' },
      clickAction: () => {
        curAccessDirInfo.selectedFiles = []
      },
    },
    {
      title: '更改访问权限',
      iconName: 'locked',
      style: { fontSize: '25px' },
      clickAction: () => {
        curAccessDirInfo.selectedFiles = []
      },
    },
  ],
})
// 文件下载弹出框
const fileDownloadPopupConfig = reactive({
  show: false,
  downloadLink: '',
  effectiveDuration: 0,
})
// 文件图标配置
const fileIconConfig = ref<any>({})
// 页面标题
const navbarConfig = reactive({
  title: '',
})

onLoad((option: any) => {
  // 更新当前访问目录信息
  if (option.curDirParentPath) {
    curAccessDirInfo.path =
      (option.curDirParentPath === '/' ? '' : option.curDirParentPath) +
      '/' +
      option.curDirName
  } else {
    curAccessDirInfo.path = '/'
  }
  // 更新页面标题
  navbarConfig.title = option.curDirName ?? '文件管理'
  // 获取文件图标配置
  getFileIconConfig().then((res) => {
    fileIconConfig.value = res
  })
})

// 通过监听变化更新文件列表
watch(
  [
    () => curAccessDirInfo.path,
    () => curAccessDirInfo.updateLeap,
    () => curAccessDirInfo.orderBy,
  ],
  async () => {
    const { data } = await getUserFiles({
      parentPath: curAccessDirInfo.path,
      status: curAccessDirInfo.status,
      orderBy: JSON.stringify(curAccessDirInfo.orderBy),
    })
    if (data?.fileInfoList && Array.isArray(data?.fileInfoList)) {
      curAccessDirInfo.fileInfoList = data.fileInfoList.map((item) => ({
        fullname:
          item.name + (item.type ? '.' + mime.extension(item.type) : ''),
        ...item,
      }))
    }
  },
  {
    immediate: true,
    deep: true,
  }
)

// 通过监听选中文件列表变化更新操作文件弹出框显示状态
watch(
  [() => curAccessDirInfo.selectedFiles],
  () => {
    operateFilePopupConfig.show = !!curAccessDirInfo.selectedFiles.length
  },
  {
    immediate: true,
    deep: true,
  }
)

const createFolder = async () => {
  try {
    await createFolderFormRef?.value?.validate()
    const { formInfo } = createFolderPopupConfig
    const { filename } = formInfo.model
    if (curAccessDirInfo.fileInfoList.some((item) => item.name === filename)) {
      uni.showToast({
        title: '文件夹已存在',
        icon: 'none',
      })
      return
    }
    await createFile([
      {
        filename,
        isDir: 1,
        parentPath: curAccessDirInfo.path,
        accessPermissions: 1,
      },
    ])
    curAccessDirInfo.updateLeap = +!curAccessDirInfo.updateLeap
    createFolderPopupConfig.show = false
    uni.showToast({
      title: '新建文件夹成功',
      icon: 'none',
    })
  } catch (err) {}
}
const handleFileClick = (fileInfo: UserFileProps & { fullname: string }) => {
  // 当处于多选状态时，点击文件选中或取消选中
  if (curAccessDirInfo.selectedFiles.length > 0) {
    if (curAccessDirInfo.selectedFiles.includes(fileInfo.id)) {
      curAccessDirInfo.selectedFiles = curAccessDirInfo.selectedFiles.filter(
        (item) => item !== fileInfo.id
      )
    } else {
      curAccessDirInfo.selectedFiles.push(fileInfo.id)
    }
    return
  }
  if (fileInfo.isDir) {
    router.push({
      name: 'fileManagement',
      params: {
        curDirParentPath: curAccessDirInfo.path,
        curDirName: fileInfo.name,
      },
    })
  }
}
const handleFileLongPress = (
  fileInfo: UserFileProps & { fullname: string }
) => {
  curAccessDirInfo.selectedFiles.push(fileInfo.id)
}
const getFileIconName = (filename: string, isDir: boolean = false) => {
  if (!Object.entries(fileIconConfig.value).length) {
    return 'default_file.svg'
  }
  const { iconDefinitions } = fileIconConfig.value as any
  if (isDir) {
    const { folder, folderNames, folderNamesExpanded } =
      fileIconConfig.value as any
    return iconDefinitions[
      folderNamesExpanded[filename] ?? folderNames[filename] ?? folder
    ].iconPath
  } else {
    const { file, fileNames, fileExtensions, languageIds } =
      fileIconConfig.value as any
    return iconDefinitions[
      fileNames[filename] ??
        fileExtensions[filename.split('.').pop() ?? ''] ??
        languageIds[filename.split('.').pop() ?? ''] ??
        file
    ].iconPath
  }
}
const copyText = (data: string = '') => {
  uni.setClipboardData({
    data: data,
    success() {
      uni.showToast({
        title: '已复制到剪贴板',
        icon: 'none',
        position: 'top',
      })
    },
  })
}
</script>
