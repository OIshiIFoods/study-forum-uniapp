<template>
  <view
    class="transition-all duration-300 overflow-hidden"
    :class="[operateFilePopupConfig.show ? 'h-164px' : 'h-0']"
  >
    <view
      class="pos-relative flex flex-wrap p-[25px_10px_10px] b-0 b-t b-solid b-[#ccc]"
    >
      <up-icon
        name="close"
        class="pos-absolute pos-top-10px pos-right-10px"
        @click="curDirInfo.selectedFiles = []"
      />
      <view
        class="relative flex flex-col justify-end items-center p-[10px_0] w-20%"
        v-for="item in operateFilePopupConfig.list"
        :key="item.title"
        @click="!item.disabled() && item.clickAction()"
      >
        <view
          class="iconfont text-[18px] mb-[6px]"
          :class="
            'icon-' +
            (typeof item.iconName === 'string'
              ? item.iconName
              : item.iconName())
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
        <button
          class="absolute w-[100%] h-[100%] bg-[rgba(0,0,0,0)] after:b-0"
          v-if="item.code === 'share'"
          open-type="share"
        />
      </view>
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
    :exclude-dir="selectDirPopupConfig.excludeDir"
    :ok-text="selectDirPopupConfig.okText"
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
  copyUserFile,
} from '@/service'
import mime from 'mime'
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
      disabled: () =>
        curDirInfo.value.selectedFiles.find((item) => !item.accessPermissions),
      style: {},
      clickAction: () => {},
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
        await updateFileInfo(
          curDirInfo.value.selectedFiles.map(({ id }) => ({ id, status: 0 }))
        )
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
        selectDirPopupConfig.isShow = true
        selectDirPopupConfig.okText = '复制到此'
        selectDirPopupConfig.excludeDir = curDirInfo.value.selectedFiles
          .filter(({ isDir }) => isDir)
          .map(({ id }) => id)
        selectDirPopupConfig.onOk = async (dirPath) => {
          const { data } = await getUserFiles({
            parentPath: dirPath,
            status: curDirInfo.value.fileStatus,
          })
          // 校验选中的文件是否在目标目录下存在
          if (
            curDirInfo.value.selectedFiles.some(({ fullname }) =>
              data.fileInfoList.find((item) => item.fullname === fullname)
            )
          ) {
            uni.showToast({
              title: '目标目录下已存在同名文件',
              icon: 'none',
            })
            return
          }
          uni.showLoading({
            title: '复制中',
          })
          await copyUserFile({
            copiedFileIdList: curDirInfo.value.selectedFiles.map(
              ({ id }) => id
            ),
            savePath: dirPath,
          })
          selectDirPopupConfig.isShow = false
          curDirInfo.value.selectedFiles = []
          uni.hideLoading()
          uni.showToast({
            title: '复制成功',
          })
        }
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
        selectDirPopupConfig.okText = '移动到此'
        selectDirPopupConfig.excludeDir = curDirInfo.value.selectedFiles
          .filter(({ isDir }) => isDir)
          .map(({ id }) => id)
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
        const selectFileInfo = curDirInfo.value.selectedFiles[0]
        modifyFilenamePopupConfig.formInfo.model.name =
          selectFileInfo.name +
          (selectFileInfo.isDir
            ? ''
            : '.' + mime.getExtension(selectFileInfo?.type ?? ''))
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

      const selectFileInfo = curDirInfo.value.selectedFiles[0]
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
  excludeDir: [] as number[],
  okText: '确定',
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
      fileType: mime.getType(filename.slice(dotIndex + 1))!,
    }
  }
}
</script>
