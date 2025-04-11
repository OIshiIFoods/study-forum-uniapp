<template>
  <view class="flex flex-col h-100vh">
    <up-navbar placeholder>
      <template #left>
        <view class="flex items-center">
          <up-icon :name="'arrow-left'" :size="20" @click="router.back()" />
          <view class="flex items-center gap-col-5px ml-12px">
            <up-avatar
              shape="circle"
              :size="40"
              :src="baseURL + '' + userInfos[chatUserId]?.avatarLink"
              customStyle="margin: -3px 5px -3px 0"
              @click.stop="
                router.push({
                  name: 'userSpace',
                  params: { userId: String(chatUserId) },
                })
              "
            />
            <view class="text-15px">
              {{ userInfos[chatUserId]?.nickname }}
            </view>
          </view>
        </view>
      </template>
    </up-navbar>
    <view class="flex flex-col flex-1">
      <view id="scroll-wrapper" class="flex flex-col flex-1 min-h-0 overflow-hidden">
        <scroll-view
          id="scroll-container"
          :style="{ height: scrollContainerProps.height + 'px' }"
          :scroll-into-view="scrollContainerProps.scrollIntoView"
          :scrollWithAnimation="scrollContainerProps.scrollWithAnimation"
          scroll-y
        >
          <view
            class="px-10px"
            v-for="(messageItem, index) in messages[chatUserId]"
            :key="messageItem.id"
            :id="'message' + (index + 1)"
          >
            <view
              v-if="
                index === 0 ||
                +dayjs(messageItem.createTime) -
                  +dayjs(messages[chatUserId][index - 1].createTime) >
                  1000 * 60 * 3
              "
              class="flex justify-center text-#A9A9A9 text-12px my-5px"
            >
              {{ dayjs(messageItem.createTime).format('YYYY-MM-DD HH:mm') }}
            </view>
            <view
              class="flex py-8px"
              :class="
                messageItem.senderId === userStore.id ? 'flex-row-reverse' : ''
              "
            >
              <up-avatar
                shape="circle"
                :size="40"
                :src="
                  baseURL + '' + userInfos[messageItem.senderId]?.avatarLink
                "
                customStyle="margin: -3px 5px -3px 0"
                @click.stop="
                  router.push({
                    name: 'userSpace',
                    params: { userId: String(messageItem.senderId) },
                  })
                "
              />
              <view
                class="p-8px bg-[var(--primary-color)] rounded-5px max-w-full"
              >
                <up-tooltip
                  :text="messageItem.content"
                  :color="'white'"
                  :buttons="['删除']"
                  @click="
                    (btnIndex) => {
                      const btnEventMap: Record<string, any> = {
                        '1': async () => {
                          deleteMessage({
                            userId: chatUserId,
                            messageIdList: [messageItem.id],
                          })
                        },
                      }
                      btnEventMap[btnIndex]?.()
                    }
                  "
                />
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
      <view id="footer" class="pos-sticky pos-bottom-0 p-8px bg-white">
        <view class="flex items-center p-[4px_8px] bg-#f5f5f5 rounded-10px">
          <SvEditor
            class="flex-1 mx-8px py-10px text-13px"
            pasteMode="origin"
            :placeholder="'发消息···'"
            @ready="(e: any) => (editorCtx = e)"
            @input="({ text = '', html = '' }) => (inputMessage = text)"
          />
          <!-- <view class="flex gap-10px">
          <up-button
            :disabled="inputMessage.length === 0"
            :shape="'circle'"
            :type="'primary'"
            :size="'small'"
            @click="
              async () => {
                await sendMessage(chatUserId, inputMessage)
                inputMessage = ''
                scrollContainerProps.scrollIntoView =
                  'message' + messages[chatUserId].length
              }
            "
          >
            发送
          </up-button>
        </view> -->
        </view>
        <SvEditorToolbar
          ref="toolbarRef"
          :tools="['emoji']"
          :customeStyle="{borderTop:0}"
          :toolbarStyle="{
            flex: 'none',
            width: 'auto',
            background: 'rgba(0,0,0,0)',
          }"
          :toolbarItemStyle="{
            flex: 'none',
            width: '80rpx',
            background: 'rgba(0,0,0,0)',
          }"
          :activeToolStyle="{ color: 'var(--primary-color)' }"
          @tapTool="()=>initialScrollContainer()"
          @keyboardChange="()=>initialScrollContainer()"
        >
          <template #toolbarRight>
            <view class="flex gap-10px mr-10px">
              <up-button
                :disabled="inputMessage.length === 0"
                :shape="'circle'"
                :type="'primary'"
                :size="'small'"
                @click="
                  async () => {
                    await sendMessage(chatUserId, inputMessage)
                    inputMessage = ''
                    scrollContainerProps.scrollIntoView =
                      'message' + messages[chatUserId].length
                  }
                "
              >
                发送
              </up-button>
            </view>
          </template>
        </SvEditorToolbar>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { baseURL } from '@/api/http'
import { useUserMessage } from '@/hooks/useUserMessage'
import router from '@/router'
import { useUserStore } from '@/stores'
import { onLoad } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import SvEditor from '@/plugins/sv-editor/components/sv-editor/sv-editor.vue'
import SvEditorToolbar from '@/plugins/sv-editor/components/sv-editor/sv-editor-toolbar.vue'
import { nextTick, reactive, ref } from 'vue'

onLoad(async (params: any) => {
  if (!params.chatUserId) {
    uni.showToast({
      title: '聊天对象不存在',
      icon: 'none',
      duration: 2000,
    })
    setTimeout(() => {
      router.back()
    }, 2000)
    return
  }
  chatUserId.value = Number(params.chatUserId)
  await updateReadStatus(
    chatUserId.value,
    messages[chatUserId.value]?.map((item) => item.id) ?? []
  )
  initialScrollContainer()
})

const { messages, userInfos, sendMessage, updateReadStatus, deleteMessage } =
  useUserMessage()
const userStore = useUserStore()
const inputMessage = ref('')
const chatUserId = ref(0)
const editorCtx = ref<any>(null)
const scrollContainerProps = reactive({
  height: 0,
  scrollIntoView: '',
  scrollWithAnimation: false,
})
const positionInfo = reactive({
  safeTop: uni.getSystemInfoSync().safeArea?.top ?? 0,
  windowHeight: uni.getSystemInfoSync().windowHeight,
  navbarHeight: 44,
})

const initialScrollContainer = () => {
  setTimeout(() => {
    uni
    .createSelectorQuery()
    .select('#footer')
    .boundingClientRect((res) => {
      const nodeInfo = Array.isArray(res) ? res[0] : res
      console.log(nodeInfo)
      Object.assign(scrollContainerProps, {
        height:positionInfo.windowHeight-positionInfo.safeTop-positionInfo.navbarHeight- nodeInfo.height!,
        scrollIntoView: 'message' + messages[chatUserId.value]?.length,
        scrollWithAnimation: true,
      })
    })
    .exec()
  },301)
}
</script>
