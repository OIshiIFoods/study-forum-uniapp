<template>
  <up-search
    placeholder="搜索文件"
    :height="35"
    :placeholderColor="'var(--text-color-grey)'"
    :showAction="false"
    :disabled="true"
    @click="searchFilePopupConfig.show = true"
  />
  <up-popup :show="searchFilePopupConfig.show" mode="right">
    <up-navbar
      :title="'搜索文件'"
      :fixed="false"
      @leftClick="searchFilePopupConfig.show = false"
    />
    <view class="w-100vw box-border p-[0_20px]">
      <view class="bg-[#f8f9fd] rounded-15px overflow-hidden">
        <up-search
          placeholder="搜索文件"
          v-model="searchFilePopupConfig.input"
          :height="35"
          :bgColor="'rgba(0,0,0,0)'"
          :actionStyle="{
            color: '#59a3f4',
            borderLeft: '1px solid #eaebef',
            marginRight: '10px',
            backgroundColor: 'rgba(0,0,0,0)',
          }"
          :placeholderColor="'#a3a8af'"
          :inputStyle="{
            color: '#a3a8af',
          }"
          :shape="'square'"
          @search="searchAction"
          @custom="searchAction"
          @clear="searchFilePopupConfig.fileList = []"
        />
      </view>
      <view>
        <view class="font-700 p-[10px_0]">
          搜索结果（{{ searchFilePopupConfig.fileList.length }}）
        </view>
        <up-cell-group>
          <up-cell
            v-for="file in searchFilePopupConfig.fileList"
            :key="file.id"
            class="p-0"
            icon="file-text"
            :iconStyle="{
              fontSize: '30px',
              paddingRight: '10px',
            }"
            :title="file.fullname"
            :titleStyle="{
              fontSize: '14px',
              fontWeight: '600',
            }"
            :label="'位置：' + file.parentPath"
            :border="false"
            clickable
            @click="
              async () => {
                router.push({
                  name: 'fileManagement',
                  params: {
                    dirPath: file.parentPath,
                  },
                })
              }
            "
          >
            <template #title>
              <view class="font-600 text-14px">
                <view
                  class="flex"
                  v-if="
                    searchFilePopupConfig.input &&
                    file.fullname.includes(searchFilePopupConfig.input)
                  "
                >
                  <view>
                    {{ file.fullname.split(searchFilePopupConfig.input)[0] }}
                  </view>
                  <view class="text-[#1196ea]">
                    {{ searchFilePopupConfig.input }}
                  </view>
                  <view>
                    {{ file.fullname.split(searchFilePopupConfig.input)[1] }}
                  </view>
                </view>
                <view v-else>
                  {{ file.fullname }}
                </view>
              </view>
            </template>
          </up-cell>
        </up-cell-group>
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { CurDirInfoType } from '../index.vue'
import { getUserFiles } from '@/service'
import router from '@/router'

const curDirInfo = defineModel<CurDirInfoType>('curDirInfo', {
  required: true,
})

const searchFilePopupConfig = reactive({
  show: false,
  input: '',
  fileList: [] as CurDirInfoType['fileList'],
})

const searchAction = async (input: string) => {
  const { data } = await getUserFiles({
    parentPath: curDirInfo.value.path,
    status: 1,
    fullname: input,
  })
  searchFilePopupConfig.fileList = data.fileInfoList.filter(
    ({ isDir }) => !isDir
  )
}
</script>
