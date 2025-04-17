<template>
  <view v-show="!curDirInfo.selectedFiles.length">
    <up-float-button
      class="flex"
      bottom="100px"
      right="10px"
      @click="filePopupConfig.show = true"
    />
  </view>
  <!-- 文件弹出框 -->
  <up-popup
    :show="filePopupConfig.show"
    mode="bottom"
    closeable
    @close="filePopupConfig.show = false"
  >
    <view class="p-[18px] bg-[linear-gradient(to_bottom,#f6eeca,#f9f8f8_60%)]">
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
          <up-input v-model="createFolderPopupConfig.formInfo.model.filename" />
        </up-form-item>
      </up-form>
      <view class="mt-[20px]">
        <up-button
          type="primary"
          text="确定"
          @click="createFolderPopupConfig.formInfo.onOk"
        />
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { uploadFile, uploadFileChunks } from '@/api/http'
import { createFile, getUserFiles } from '@/service'
import { CurDirInfoType } from '../index.vue'
import { reactive, ref } from 'vue'
import type { _FormRef } from 'uview-plus/types/comps/form'

const curDirInfo = defineModel<CurDirInfoType>('curDirInfo', {
  required: true,
})

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
                const uploadFileRes = await uploadFileChunks(
                  'file',
                  res.tempFiles.map(({ name, path, size }) => ({
                    name,
                    filePath: path,
                    filename: name,
                    size,
                  }))
                )
                const createRes = await createFile(
                  uploadFileRes.success.map(
                    ({ url, encoding, originalname, ...otherInfo }) => ({
                      parentPath: curDirInfo.value.path,
                      accessPermissions: 1,
                      isDir: 0,
                      originalname,
                      ...otherInfo,
                    })
                  )
                )
                uni.hideLoading()
                filePopupConfig.show = false
                const { data } = await getUserFiles({
                  parentPath: curDirInfo.value.path,
                  status: curDirInfo.value.fileStatus,
                })
                curDirInfo.value.fileList = data.fileInfoList
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
            createFolderPopupConfig.formInfo.model.filename = ''
            filePopupConfig.show = false
            createFolderPopupConfig.show = true
          },
        },
      ],
    },
  ],
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
    onOk: async () => {
      try {
        await createFolderFormRef?.value?.validate()
        const { formInfo } = createFolderPopupConfig
        const { filename } = formInfo.model
        if (
          curDirInfo.value.fileList.find(
            (item) => item.isDir && item.name === filename
          )
        ) {
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
            parentPath: curDirInfo.value.path,
            accessPermissions: 1,
          },
        ])
        const { data } = await getUserFiles({
          parentPath: curDirInfo.value.path,
          status: curDirInfo.value.fileStatus,
        })
        curDirInfo.value.fileList = data.fileInfoList
        createFolderPopupConfig.show = false
        uni.showToast({
          title: '新建文件夹成功',
          icon: 'none',
        })
      } catch (err) {}
    },
  },
})
</script>
