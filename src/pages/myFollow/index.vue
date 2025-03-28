<template>
  <view>
    <up-navbar auto-back placeholder>
      <template #center>
        <up-tabs
          :list="tabbarItemList"
          :duration="200"
          lineHeight="2"
          lineWidth="45"
          lineColor="var(--primary-color)"
          :activeStyle="{
            color: 'var(--primary-color)',
            fontWeight: 700,
          }"
          itemStyle="flex:1; fontSize:10px; padding:3px 15px 10px; color:#878787;"
          :onChange="(item: any) => (activeTab = item.code)"
        />
      </template>
    </up-navbar>
    <view class="bg-white rounded-20px box-border p-10px">
      <FollowItem
        v-for="item in followList"
        :key="item.id"
        v-bind="item"
        @update-follow-item="
          (itemId: number, updateContent: Partial<FollowItemProps>) => {
            const index = followList.findIndex((item) => item.id === itemId)
            if (index !== -1) {
              followList[index] = { ...followList[index], ...updateContent }
            }
          }
        "
        @delete-follow-item="(itemId: number)=>{
          followList = followList.filter((item) => item.id !== itemId)
        }"
        "
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { getFollowUserList } from '@/service'
import type { GetFollowUserList } from '@/service/types/api'
import { onShow } from '@dcloudio/uni-app'
import { ref, watch } from 'vue'
import FollowItem, { type FollowItemProps } from '@/components/FollowItem.vue'

const tabbarItemList = [
  {
    code: 'mutual',
    name: '互相关注',
  },
  {
    code: 'follow',
    name: '关注',
  },
  {
    code: 'fans',
    name: '粉丝',
  },
]
const activeTab = ref<string | undefined>(tabbarItemList[0].code)
const followList = ref<FollowItemProps[]>([])

onShow(async () => {
  await searchAction()
})

watch(activeTab, async (newVal) => {
  await searchAction()
})

const searchAction = async () => {
  const { data } = await getFollowUserList({
    type: activeTab.value as 'follow' | 'fans' | 'mutual',
  })
  if (activeTab.value === 'mutual') {
    followList.value = data.followList.map((item) => ({
      buttonType: 'sendMsg',
      ...item,
    }))
  } else if (activeTab.value === 'follow') {
    followList.value = data.followList.map((item) => ({
      buttonType: item.isMutual ? 'mutualFollow' : 'hasFollow',
      desc: '开始关注了他',
      ...item,
    }))
  } else {
    followList.value = data.followList.map((item) => ({
      buttonType: item.isMutual ? 'mutualFollow' : 'returnFollow',
      ...item,
    }))
  }
}
</script>
