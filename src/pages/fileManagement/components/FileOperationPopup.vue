<template>
  <view
    v-show="operateFilePopupConfig.show"
    class="pos-relative flex flex-wrap p-[25px_10px_10px] b-0 b-t b-solid b-[#ccc] animate-duration-150 animate-keyframes-slide-in-up"
  >
    <up-icon
      name="close"
      class="pos-absolute pos-top-10px pos-right-10px"
      @click="curDirInfo.selectedFiles = []"
    />
    <view
      class="flex flex-col justify-end items-center p-[10px_0] w-20%"
      v-for="item in operateFilePopupConfig.list"
      :key="item.title"
      @click="!item.disabled() && item.clickAction()"
    >
      <view
        class="iconfont text-[18px] mb-[6px]"
        :class="
          'icon-' +
          (typeof item.iconName === 'string' ? item.iconName : item.iconName())
        "
        :style="{
          ...item.style,
          ...(item.disabled() ? { color: '#ccc' } : {}),
        }"
      />
      <text
        class="text-[10px] font-700"
        :style="{
          ...(item.disabled() ? { color: '#ccc' } : {}),
        }"
      >
        {{ item.title }}
      </text>
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
  <!-- 修改文件名称弹出窗 -->
  <up-popup
    :show="modifyFilenamePopupConfig.show"
    mode="center"
    closeable
    @close="modifyFilenamePopupConfig.show = false"
  >
    <view class="p-[40px_16px_12px]">
      <up-form
        ref="modifyFilenameFormRef"
        :model="modifyFilenamePopupConfig.formInfo.model"
        :rules="modifyFilenamePopupConfig.formInfo.rules"
      >
        <up-form-item prop="name" label="文件名称：" :labelWidth="100">
          <up-input v-model="modifyFilenamePopupConfig.formInfo.model.name" />
        </up-form-item>
      </up-form>
      <view class="mt-[20px]">
        <up-button
          type="primary"
          text="确定"
          @click="modifyFilenamePopupConfig.formInfo.onOk"
        />
      </view>
    </view>
  </up-popup>
  <!-- 选择文件夹弹出窗 -->
  <SelectFolderPopup
    v-model:isShow="selectDirPopupConfig.isShow"
    :exclude-dir="
      curDirInfo.selectedFiles.filter(({ isDir }) => isDir).map(({ id }) => id)
    "
    @onOk="selectDirPopupConfig.onOk"
  />
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import {
  getFileDownloadUrl,
  deleteFile,
  updateFileInfo,
  getUserFiles,
} from '@/service'
import mime from 'mime-types'
import type { CurDirInfoType } from '../index.vue'
import SelectFolderPopup from './SelectFolderPopup.vue'

const curDirInfo = defineModel<CurDirInfoType>('curDirInfo', {
  required: true,
})

/** 操作文件弹出窗配置 */
const operateFilePopupConfig = reactive({
  show: false,
  list: [
    {
      code: 'download',
      title: '下载',
      iconName: 'download',
      style: {},
      clickAction: async () => {
        uni.showLoading({
          title: '下载中',
        })
        const { data } = await getFileDownloadUrl({
          fileIdList: curDirInfo.value.selectedFiles.map(({ id }) => id),
        })
        uni.hideLoading()
        Object.assign(fileDownloadPopupConfig, {
          show: true,
          ...data,
        })
        curDirInfo.value.selectedFiles = []
      },
    },
    {
      code: 'share',
      title: '分享',
      iconName: 'share',
      style: {},
      clickAction: () => {
        curDirInfo.value.selectedFiles = []
      },
    },
    {
      code: 'delete',
      title: '删除',
      iconName: 'delete',
      style: {},
      clickAction: async () => {
        uni.showLoading({
          title: '删除中',
        })
        await deleteFile({
          fileIdList: curDirInfo.value.selectedFiles.map(({ id }) => id),
        })
        uni.hideLoading()
        uni.showToast({ title: '删除成功', icon: 'none' })
        const { data } = await getUserFiles({
          parentPath: curDirInfo.value.path,
          status: curDirInfo.value.fileStatus,
        })
        curDirInfo.value.fileList = data.fileInfoList
        curDirInfo.value.selectedFiles = []
      },
    },
    {
      code: 'copy',
      title: '复制',
      iconName: 'copy',
      style: { fontSize: '23px' },
      clickAction: () => {
        curDirInfo.value.selectedFiles = []
      },
    },
    {
      code: 'move',
      title: '移动',
      iconName: 'move',
      style: {},
      disabled: () => curDirInfo.value.selectedFiles.find(({ isDir }) => isDir),
      clickAction: () => {
        selectDirPopupConfig.isShow = true
        selectDirPopupConfig.onOk = async (dirPath) => {
          uni.showLoading({
            title: '移动中',
          })
          await updateFileInfo(
            curDirInfo.value.selectedFiles.map(({ id }) => ({
              id,
              parentPath: dirPath,
            }))
          )
          const { data } = await getUserFiles({
            parentPath: curDirInfo.value.path,
            status: curDirInfo.value.fileStatus,
          })
          curDirInfo.value.fileList = data.fileInfoList
          selectDirPopupConfig.isShow = false
          curDirInfo.value.selectedFiles = []
          uni.hideLoading()
          uni.showToast({
            title: '移动成功',
          })
        }
      },
    },
    {
      code: 'rename',
      title: '重命名',
      iconName: 'rename',
      style: { fontSize: '18px' },
      disabled: () => curDirInfo.value.selectedFiles.length !== 1,
      clickAction: () => {
        const selectFileInfo = curDirInfo.value.fileList[0]
        modifyFilenamePopupConfig.formInfo.model.name =
          selectFileInfo.name +
          (selectFileInfo.isDir
            ? ''
            : '.' + mime.extension(selectFileInfo?.type ?? ''))
        modifyFilenamePopupConfig.show = true
      },
    },
    {
      code: 'accessPermission',
      title: '更改访问权限',
      iconName: () =>
        curDirInfo.value.selectedFiles[0]?.accessPermissions
          ? 'unlocked'
          : 'locked',
      style: { fontSize: '25px' },
      disabled: () => curDirInfo.value.selectedFiles.length !== 1,
      clickAction: async () => {
        const selectFile = curDirInfo.value.selectedFiles[0]
        await updateFileInfo([
          {
            id: selectFile.id,
            accessPermissions: selectFile.accessPermissions ? 0 : 1,
          },
        ])
        const { data } = await getUserFiles({
          parentPath: curDirInfo.value.path,
          status: curDirInfo.value.fileStatus,
        })
        curDirInfo.value.fileList = data.fileInfoList
        curDirInfo.value.selectedFiles = []
        uni.showToast({
          title: '修改访问权限成功',
          icon: 'none',
        })
      },
    },
  ].map((item) => ({
    disabled: (): boolean => false,
    ...item,
  })),
})

const modifyFilenamePopupConfig = reactive({
  show: false,
  formInfo: {
    model: {
      name: '',
    },
    rules: {
      name: {
        type: 'string',
        required: true,
        message: '请输入文件名称',
        trigger: ['blur'],
      },
    },
    onOk: async () => {
      const inputName = modifyFilenamePopupConfig.formInfo.model.name

      const selectFileInfo = curDirInfo.value.fileList[0]
      const { filename: inputFilename, fileType: inputFileType } =
        parseFilename(inputName)
      const {
        id: selectFileId,
        type: selectFileType,
        isDir: selectFileIsDir,
      } = selectFileInfo
      if (selectFileIsDir) {
        // 同名文件校验
        const sameFile = curDirInfo.value.fileList.find(
          (item) => item.id !== selectFileId && item.name === inputName
        )
        if (sameFile) {
          uni.showToast({
            title: '修改失败，文件夹已存在',
            icon: 'none',
          })
          return
        }
      } else {
        // 同名同类型文件校验
        const sameFile = curDirInfo.value.fileList.find(
          (item) =>
            item.id !== selectFileId &&
            item.name === inputFilename &&
            item.type === inputFileType
        )
        if (sameFile) {
          uni.showToast({
            title: '修改失败，文件已存在',
            icon: 'none',
          })
          return
        }
        // 文件类型修改时的提示
        if (selectFileType !== inputFileType) {
          const shouldUpdate = await new Promise((resolve, reject) => {
            uni.showModal({
              title: '提示',
              content: '更改文件类型可能导致文件无法打开，是否更改?',
              cancelText: '取消',
              confirmText: '确认',
              success: async ({ errMsg, confirm, cancel }) => {
                resolve(confirm)
              },
            })
          })
          if (!shouldUpdate) {
            return
          }
        }
      }
      await updateFileInfo([
        {
          id: selectFileId,
          name: inputFilename,
          type: inputFileType,
        },
      ])
      uni.showToast({
        title: '修改成功',
        icon: 'none',
      })
      const { data } = await getUserFiles({
        parentPath: curDirInfo.value.path,
        status: curDirInfo.value.fileStatus,
      })
      modifyFilenamePopupConfig.show = false
      curDirInfo.value.fileList = data.fileInfoList
      curDirInfo.value.selectedFiles = []
    },
  },
})

/** 文件下载弹出框 */
const fileDownloadPopupConfig = reactive({
  show: false,
  downloadLink: '',
  effectiveDuration: 0,
})

/** 文件夹选择弹出框 */
const selectDirPopupConfig = reactive({
  isShow: false,
  onOk: async (dirname: string) => {
    console.log(dirname)
  },
})

// 通过监听选中文件列表变化更新操作文件弹出框显示状态
watch(
  [() => curDirInfo.value.selectedFiles],
  () => {
    operateFilePopupConfig.show = !!curDirInfo.value.selectedFiles.length
  },
  {
    deep: true,
  }
)

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

const parseFilename = (filename: string) => {
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex === -1) {
    return { filename, fileType: undefined }
  } else {
    return {
      filename: filename.slice(0, dotIndex),
      fileType: mime.types[filename.slice(dotIndex + 1)],
    }
  }
}
</script>
