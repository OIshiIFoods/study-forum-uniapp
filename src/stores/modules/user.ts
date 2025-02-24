import { getUserInfo } from '@/service'
import type { UserProps } from '@/service/types/db'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state() {
    return {
      id: undefined,
      phoneNumber: '',
      nickname: '',
      registerDate: '',
      signature: '',
      avatarLink: '',
      sex: undefined,
      birthday: '',
      space_open_status: undefined,
      availableSpaceSize: undefined,
      usedSpaceSize: undefined,
      articleCount: 0,
      followCount: 0,
      fansCount: 0,
      likeCount: 0,
      collectionCount: 0,
    } as Partial<UserProps>
  },
  getters: {},
  actions: {
    async syncUserInfo() {
      await getUserInfo().then((res) => {
        this.$patch(res.data)
      })
    },
  },
})
