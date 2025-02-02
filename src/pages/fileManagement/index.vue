<template>
  <view class="box-border p-[0_calc(var(--page-side-unit-size)*5)]">
    <!-- 搜索栏 -->
    <up-navbar title="文件管理" auto-back placeholder />
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
        v-for="item in curAccessDirInfo.fileInfoList"
        :key="item.id"
        class="overflow-hidden"
      >
        <up-cell
          :title="item.name"
          :titleStyle="{ color: '#000', fontSize: '14px' }"
          :label="dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss')"
          :border="false"
        >
          <template #icon>
            <view
              class="w-[40px] p-t-[100%] m-r-10px bg-center bg-contain bg-no-repeat"
              :style="{
                backgroundImage: `url(../../static/images/fileIcons/${getFileIconName(item.fullname, !!item.isDir)})`,
              }"
            />
          </template>
          <template #right-icon>
            <view
              class="w-10px h-10px b-1px b-style-solid b-[#ccc] rounded-full"
            />
          </template>
        </up-cell>
      </up-list-item>
    </up-list>
    <view v-else class="flex flex-wrap">
      <view
        v-for="item in curAccessDirInfo.fileInfoList"
        :key="item.id"
        class="pos-relative flex flex-col items-center justify-center w-[25%] box-border p-[10px] overflow-hidden"
      >
        <view
          class="w-[70%] p-t-[100%] bg-center bg-contain bg-no-repeat"
          :style="{
            backgroundImage: `url(../../static/images/fileIcons/${getFileIconName(item.fullname, !!item.isDir)})`,
          }"
        />
        <text class="text-[12px]">{{ item.fullname }}</text>
        <view
          class="pos-absolute pos-top-3px pos-right-3px w-10px h-10px b-1px b-style-solid b-[#ccc] rounded-full"
        />
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
          <view class="text-15px font-700 m-[20px_0]">{{ column.title }}</view>
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
    <!-- 悬浮按钮 -->
    <up-float-button
      class="flex"
      bottom="100px"
      right="10px"
      @click="filePopupConfig.show = true"
    />
  </view>
</template>

<script setup lang="ts">
import router from '@/router'
import { createFile, getUserFiles } from '@/service'
import type { UserFileProps } from '@/service/types/db'
import dayjs from 'dayjs'
import { reactive, ref, watch } from 'vue'
import fileIconConfig from './config/fileIconConfig'
import type { _FormRef } from 'uview-plus/types/comps/form'
import { baseURL, uploadFile } from '@/api/http'
import mime from 'mime-types'

type OrderByOptions = {
  /** 字段名称 */
  field: string
  /** 排序方向 */
  direction: 'ASC' | 'DESC'
}

const curAccessDirInfo = reactive({
  path: '/',
  updateLeap: 1,
  orderBy: [] as OrderByOptions[],
  status: 1,
  fileInfoList: [] as (UserFileProps & { fullname: string })[],
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

const createFolder = async () => {
  try {
    await createFolderFormRef?.value?.validate()
    const { formInfo } = createFolderPopupConfig
    const { filename } = formInfo.model
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
const getFileIconName = (filename: string, isDir: boolean = false) => {
  const { iconDefinitions } = fileIconConfig as any
  if (isDir) {
    const { folder, folderNames, folderNamesExpanded } = fileIconConfig as any
    return iconDefinitions[
      folderNamesExpanded[filename] ?? folderNames[filename] ?? folder
    ].iconPath
  } else {
    const { file, fileNames, fileExtensions, languageIds } =
      fileIconConfig as any
    return iconDefinitions[
      fileNames[filename] ??
        fileExtensions[filename.split('.').pop() ?? ''] ??
        languageIds[filename.split('.').pop() ?? ''] ??
        file
    ].iconPath
  }
}
</script>
