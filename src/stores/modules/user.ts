import { getUserInfo } from '@/service'
import type { GetUserInfo } from '@/service/types/api'
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
      spaceOpenStatus: undefined,
      availableSpaceSize: undefined,
      usedSpaceSize: undefined,
      articleCount: 0,
      followCount: 0,
      fansCount: 0,
      likeCount: 0,
      collectionCount: 0,
      followList: [],
      blacklist: [],
    } as Partial<GetUserInfo.Response['data']>
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
