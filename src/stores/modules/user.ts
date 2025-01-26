import type { UserProps } from '@/service/types/db'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state() {
    return {} as Partial<UserProps>
  },
  getters: {},
  // 配置持久化
  persist: {
    storage: {
      setItem(key, value) {
        uni.setStorageSync(key, value)
      },
      getItem(key) {
        return uni.getStorageSync(key)
      },
    },
  },
})
