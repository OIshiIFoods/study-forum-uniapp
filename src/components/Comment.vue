<template>
  <view class="p-10rpx">
    <!-- 评论主体-start -->
    <view v-if="commentData.comment.length !== 0">
      <!-- 评论主体-顶部数量及发表评论按钮-start -->
      <view class="flex justify-between items-center py-20rpx">
        <view>共 {{ commentData.comment.length }} 条评论</view>
        <button class="m-0" type="primary" size="mini" @click="commentInput">
          发表评论
        </button>
      </view>
      <!-- 评论主体-顶部数量及发表评论按钮-end -->
      <!-- 评论列表-start -->
      <view v-for="(rootCom, index) in commentData.comment" :key="rootCom.id">
        <view class="flex">
          <image
            :src="rootCom.avatarLink || emptyAvatar"
            mode="aspectFill"
            class="w-70rpx h-70rpx rounded-50%"
          />
          <view class="flex-1 pl-20rpx">
            <!-- 父评论体-start -->
            <view class="flex justify-between pt-6rpx">
              <view class="flex items-center">
                <view
                  class="mr-18rpx text-22rpx rounded-10rpx p-[5rpx_15rpx] text-white"
                  :style="{
                    backgroundColor:
                      ['#d218b1', '#f19c0b', '#c8da85'][index] ?? '#bfd0da',
                  }"
                >
                  {{ ['沙发', '板凳', '地板'][index] ?? index + 1 + '楼' }}
                </view>
                <view class="text-#2d8cf0">{{ rootCom.nickname }}</view>
              </view>
              <view @click="like(rootCom.id)">
                <span
                  class="text-28rpx pr-10rpx"
                  :class="rootCom.hasLike ? 'text-#2d8cf0' : 'text-#999'"
                >
                  {{ rootCom.likeCount == 0 ? '抢首赞' : rootCom.likeCount }}
                </span>
                <image
                  style="width: 14px; height: 14px"
                  v-if="!rootCom.hasLike"
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAApVJREFUWEfFlz9oFEEUxr93SWEhFkIaBUljo4WgATEaiI0GwVLBQg2EzLd3hSBqLI2lRgWLY+ftSSQgggoWNv5pImLUwjQBg1goqCCIIBqwueSeTLg7Ln9Mcmdub7vdnZnvN9+8fe+toMWXtFgfDQGMjo52zM7OHgMwIyLTg4ODk41upG4A7/0OEbkPYGdFVEQuOOeuNQJRN4CqBvGw+3dm9kZEBsrCPSRf1gvRCIAFETPrjqLodZIkY2Z2SkQmnHMHUgMgOQ8fx3FvJpMZB/CDZEfqACEgi8XidwA/SW5uKkCN2AzJTYscmCTZ1VQA7/2AiNwSkefOuYNBLEmSnJnlATwgebypAKr6CMBRANdJng9i3vu8iORE5Mrc3NyTlQDM7HMul/tYO2bNX0GhUDhRKpXumtlvAPuiKJouOzBuZr117HyBU6sCqOpeAH0AhssiwyQvVwTjOO5va2s7vRaAGtCrJC+GOVUAVb1UTjDVDLd4URHJOuf8WsSWG5MkSbeZTYR3lc+4CpAkyUpWht3fI/m+UfEwL5/Pb2xvb59ZFkBV5zNchazsSBBeYPn/ABQKhZ5SqfQCwBTJXYuPoOkAqnoGwE0Ad0ieTB3Ae39bRPoBDJEcSR1AVd8C2CMifc65p6kCmJkkSfIHwAYAW0h+SxVAVXcDmDSzL1EUbasEc20eaGoQVuoIgMckj6QOoKo3AJwFMEJyqBUAIegOAegnOdYKgK8AtmYyma7aLjqVGPDebxeRDwB+AeggWUzVAVV1ABTAK5L7l+0HVPUTgM7Q7VQGhPJZe99oHagpw4dJPvsXQPixONeoyErzRGTKzB7W9hFLjiA8iOO4M7iw3hDZbLbq6pIeY73F6l1v1Zas3gXrHf8XhhNvMGSmtPYAAAAASUVORK5CYII="
                />
                <image
                  style="width: 14px; height: 14px"
                  v-else
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAfVJREFUWEfFl79LHEEUx7/vclr4g51TLFQQW9FNDFhFBDvjtcF0gXSp5eYuWJlUAW9NIP9BIFUEOxFtTKF2FrezKFgkkEBS3h4SAtHbJ6vu5W5d1F3cm20WZt+b7+e9mTfzlqD5Ic36SATw+OPJQP2ft+ABJwQ+VFIcJA0kEYBpVfcAehKIMqHoFISVBCI2wOS76mi9g76HxTLwZiqybzcuRGwAc7WWB/NGWIhBu440ZlIHmFitLRPzm+tC9EtJY1gjAP9VMtelEQC2kuJR6gCm5X4BsBAWImDdluJZqgBjH/4MZr3TYzB6IoRWmHnzJgDK0g+1KL4128SqgnD9x432yn5NSfE88L0VYPx9rS/jYR6EJTCPJxQNu60oKV77gw2Ai/Ly1/ZKRElx8c20XL4n0ZZpgvkbAKbl7gCYDax0ALREmjJAo2SbM9A+AKLPqmC8aNkD4bVOMwPEKNlFUdYGkAE9rUhjSxvA2YOOoaPF7t+6AH4qKUauHURt3AObSoq8NgAGyo4UJW0ABH5py9wnbQAAppq76HYfRLXOXmPg4BWdasoA7yuZm47sB0zL9Vvt0TQvI/bqc06pfzsS4KHlWgwUUgKwmWjdKRhvI1q5/0P+T8dZ9jILTjH31X9PlKuNKzppXxDMFeV/a0eUVPSuftoBzgHKR/ohZwAugwAAAABJRU5ErkJggg=="
                />
              </view>
            </view>
            <view class="p-[10rpx] pl-0">
              {{
                rootCom.content?.length > 60
                  ? rootCom.content.slice(0, 59)
                  : rootCom.content
              }}
              <span v-if="rootCom.content?.length > 60">
                {{ rootCom.hasShowMore ? rootCom.content.slice(59) : '...' }}
                <span class="pl-10rpx" @click="showMore(rootCom.id)">
                  {{ rootCom.hasShowMore ? '收起' : '展开' }}
                </span>
              </span>
            </view>
            <view class="flex text-22rpx">
              <view>{{ rootCom.createTime }}</view>
              <view
                class="pl-10rpx text-#007aff"
                @click="reply(rootCom.nickname, rootCom.nickname, rootCom.id)"
              >
                回复
              </view>
              <view
                class="pl-10rpx text-#007aff"
                v-if="rootCom.owner"
                @click="confirmDelete(rootCom.id)"
              >
                删除
              </view>
            </view>
            <!-- 父评论体-end -->
            <!-- 子评论列表-start -->
            <view class="p-[20rpx_0]">
              <view
                class="flex"
                v-for="sCom in rootCom.children"
                :key="sCom.id"
              >
                <image
                  :src="sCom.avatarLink || emptyAvatar"
                  mode="aspectFill"
                  class="w-50rpx h-50rpx rounded-50%"
                />
                <view class="flex-1 pl-20rpx">
                  <view class="flex justify-between pt-6rpx">
                    <view class="text-#2d8cf0">{{ sCom.nickname }}</view>
                    <view @click="like(sCom.id)">
                      <span
                        class="text-28rpx pr-10rpx"
                        :class="rootCom.hasLike ? 'text-#2d8cf0' : 'text-#999'"
                      >
                        {{ sCom.likeCount == 0 ? '抢首赞' : sCom.likeCount }}
                      </span>
                      <image
                        style="width: 14px; height: 14px"
                        v-if="!sCom.hasLike"
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAApVJREFUWEfFlz9oFEEUxr93SWEhFkIaBUljo4WgATEaiI0GwVLBQg2EzLd3hSBqLI2lRgWLY+ftSSQgggoWNv5pImLUwjQBg1goqCCIIBqwueSeTLg7Ln9Mcmdub7vdnZnvN9+8fe+toMWXtFgfDQGMjo52zM7OHgMwIyLTg4ODk41upG4A7/0OEbkPYGdFVEQuOOeuNQJRN4CqBvGw+3dm9kZEBsrCPSRf1gvRCIAFETPrjqLodZIkY2Z2SkQmnHMHUgMgOQ8fx3FvJpMZB/CDZEfqACEgi8XidwA/SW5uKkCN2AzJTYscmCTZ1VQA7/2AiNwSkefOuYNBLEmSnJnlATwgebypAKr6CMBRANdJng9i3vu8iORE5Mrc3NyTlQDM7HMul/tYO2bNX0GhUDhRKpXumtlvAPuiKJouOzBuZr117HyBU6sCqOpeAH0AhssiwyQvVwTjOO5va2s7vRaAGtCrJC+GOVUAVb1UTjDVDLd4URHJOuf8WsSWG5MkSbeZTYR3lc+4CpAkyUpWht3fI/m+UfEwL5/Pb2xvb59ZFkBV5zNchazsSBBeYPn/ABQKhZ5SqfQCwBTJXYuPoOkAqnoGwE0Ad0ieTB3Ae39bRPoBDJEcSR1AVd8C2CMifc65p6kCmJkkSfIHwAYAW0h+SxVAVXcDmDSzL1EUbasEc20eaGoQVuoIgMckj6QOoKo3AJwFMEJyqBUAIegOAegnOdYKgK8AtmYyma7aLjqVGPDebxeRDwB+AeggWUzVAVV1ABTAK5L7l+0HVPUTgM7Q7VQGhPJZe99oHagpw4dJPvsXQPixONeoyErzRGTKzB7W9hFLjiA8iOO4M7iw3hDZbLbq6pIeY73F6l1v1Zas3gXrHf8XhhNvMGSmtPYAAAAASUVORK5CYII="
                      />
                      <image
                        style="width: 14px; height: 14px"
                        v-else
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAfVJREFUWEfFl79LHEEUx7/vclr4g51TLFQQW9FNDFhFBDvjtcF0gXSp5eYuWJlUAW9NIP9BIFUEOxFtTKF2FrezKFgkkEBS3h4SAtHbJ6vu5W5d1F3cm20WZt+b7+e9mTfzlqD5Ic36SATw+OPJQP2ft+ABJwQ+VFIcJA0kEYBpVfcAehKIMqHoFISVBCI2wOS76mi9g76HxTLwZiqybzcuRGwAc7WWB/NGWIhBu440ZlIHmFitLRPzm+tC9EtJY1gjAP9VMtelEQC2kuJR6gCm5X4BsBAWImDdluJZqgBjH/4MZr3TYzB6IoRWmHnzJgDK0g+1KL4128SqgnD9x432yn5NSfE88L0VYPx9rS/jYR6EJTCPJxQNu60oKV77gw2Ai/Ly1/ZKRElx8c20XL4n0ZZpgvkbAKbl7gCYDax0ALREmjJAo2SbM9A+AKLPqmC8aNkD4bVOMwPEKNlFUdYGkAE9rUhjSxvA2YOOoaPF7t+6AH4qKUauHURt3AObSoq8NgAGyo4UJW0ABH5py9wnbQAAppq76HYfRLXOXmPg4BWdasoA7yuZm47sB0zL9Vvt0TQvI/bqc06pfzsS4KHlWgwUUgKwmWjdKRhvI1q5/0P+T8dZ9jILTjH31X9PlKuNKzppXxDMFeV/a0eUVPSuftoBzgHKR/ohZwAugwAAAABJRU5ErkJggg=="
                      />
                    </view>
                  </view>
                  <view class="p-10rpx pl-0">
                    {{
                      sCom.content?.length > 60
                        ? sCom.content.slice(0, 59)
                        : sCom.content
                    }}
                    <span v-if="sCom.content?.length > 60">
                      {{ sCom.hasShowMore ? sCom.content.slice(59) : '...' }}
                      <span
                        class="pl-10rpx text-#007aff"
                        @click="showMore(sCom.id)"
                      >
                        {{ sCom.hasShowMore ? '收起' : '展开' }}
                      </span>
                    </span>
                  </view>
                  <view class="flex text-22rpx">
                    <view class="foot-time">{{ sCom.createTime }}</view>
                    <view
                      class="pl-10rpx text-#007aff"
                      @click="
                        reply(
                          rootCom.nickname,
                          sCom.nickname,
                          rootCom.id,
                          sCom.id
                        )
                      "
                    >
                      回复
                    </view>
                    <view
                      class="pl-10rpx text-#007aff"
                      v-if="sCom.owner"
                      @click="confirmDelete(sCom.id)"
                    >
                      删除
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <!-- 子评论列表-end -->
          </view>
        </view>
      </view>
      <!-- 评论列表-end -->
    </view>
    <!-- 评论主体-end -->
    <!-- 无评论-start -->
    <view class="p-20rpx w-full text-center text-#999" v-else>
      暂无评论，
      <span @click="commentInput" style="color: #007aff">抢沙发</span>
    </view>
    <!-- 无评论-end -->
    <!-- 新增评论-start -->
    <view
      class="fixed flex items-center w-full z-9900 pos-left-0 pos-top-[var(--window-top)] pos-bottom-0 bg-[rgba(0,0,0,.5)]"
      v-if="submit"
      @click="closeInput"
    >
      <!-- 下边的click.stop.prevent用于让上边的click不传下去，以防点到下边的空白处触发closeInput方法 -->
      <view
        class="fixed bg-#fff w-full p-5rpx b b-solid b-#ddd transition-duration-300"
        @click.stop.prevent="stopPrevent"
        :style="'bottom:' + KeyboardHeight + 'px'"
      >
        <view
          class="flex justify-between items-center p-[5rpx_20rpx_0] b-b b-b-dashed b-b-#ddd w-[calc(100%-40rpx)]"
        >
          <view class="text-#606266 text-28rpx p-10rpx" @click="closeInput">
            取消
          </view>
          <view>
            <view
              class="flex justify-between items-center text-16rpx p-[5px_10px] text-#909399 mb-5px b b-solid b-#c8c9cc bg-#f4f4f5 rounded-3px"
              v-if="showTag"
            >
              <view>回复在 {{ pUser }} 的评论下</view>
              <view
                @click="tagClose"
                class="text-20px line-height-12px p-[0_0_2px_5px]"
              >
                ×
              </view>
            </view>
          </view>
          <view>
            <view class="text-#007aff text-28rpx p-10rpx" @click="add">
              发布
            </view>
          </view>
        </view>
        <textarea
          class="h-100px p-16rpx w-full"
          v-model="commentReq.content"
          :placeholder="placeholder"
          :adjust-position="false"
          :show-confirm-bar="false"
          @blur="blur"
          @focus="focusOn"
          :focus="focus"
          maxlength="800"
        ></textarea>
      </view>
    </view>
    <!-- 新增评论-end -->
  </view>
</template>

<script>
export default {
  name: 'hb-comment',
  props: {
    cmData: {
      type: Object,
      default: () => {
        return null
      },
    },
    deleteTip: {
      type: String,
      default: () => {
        return '操作不可逆，如果评论下有子评论，也将被一并删除，确认？'
      },
    },
  },
  watch: {
    cmData: {
      handler: function (newVal, oldVal) {
        this.init(newVal)
      },
      immediate: true,
    },
  },
  data() {
    return {
      emptyAvatar:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABF5JREFUWEfFl11oHFUUx//nbmKwxdJ9qFL7YPEhRJC2gljjF60WG0WsoNkWfSnZ7Jy7FVPF0AoKpmBFqyIG3Jk7G1iIQXHbBz+KbbGtRfBbMe2LseKjiVDoiqIhwZ0jV3fb3cnM7kQCuU+7M+ec/+9+nHPPEJZ50DLrY1EApVJp9fz8/BYRuZ2INgDYWJvAWRE5R0RnZmZmPh4ZGZlPOrFEAMVi8e4gCPYSUZ+IXGGFgiCYIaJpKyQi1yql1orIFgAXARxRSvm5XO67diBtAYwxRQCDAE4RUUkpdWxwcNCKLBiu665TSj0kIpqIbgTgMzO3gmgJYIz5CMB9AIaZ+bXGQMVi8RoRuZeI/lZKHc1ms3/U34+Pj6+cnZ3dC+AggGPMfH8cRCyAMUZqThlmPlwPUCgU0qlUyq7Kww1BrbjHzPsahYwx/QDK9hkzR2pFPjTGnAWwIexkjOkRkRIR3Rozo5Miskdr/VMIxE7mHDPXD+2l1wsA6nseBMHmfD7/dSjQOwB2tTlYC/bddd1blFJfARhj5lyjfxNA7bSfitpz3/d3iYgFaDuUUjeHM8AY8zSAV5VS9+RyudP1IE0Axpj3Aaxk5m1hFc/zPiWiO9uq/2dwiJn3h22NMScB/MnMOxYAjI6Orurq6rpgU0hrXYpw/hFAd0KAD5n5wbCt7/t7ROT1ubm5NUNDQ7/b95dWwHXd7Uqp452dnVcPDAxciACwDlclAbAFynGcdRGr2EtEnwdB0JfP5080ARhjDhLRbY7jbI0SMcZUAKxOAgDgN2ZOx8SxGfEiMz/bBOD7/lgQBCu01o/GOH4PYFNCgElmvinK1vf9X2xxchzHVtfLW2CMOQpgipmHYwBeBtBUaOJgRKSgtX48Js63AH5l5geaADzPe1cpddFxnHyM42YAXyZYAXt+epn557iVFJHzWuudYYDnlFJ9juPcESfi+35JRHa3gdjPzIfibIwxNtPe0Fq/EAZ4hIhcZl4T5+y67nql1CcA1kfZENFnrSZQ6ycqItKvtT4SBthIRJMdHR092WzW5nzk8H1/WEReiQHY4TjOB3G+nuf9qyEim7TW9r65fAjL5fKVlUrlPICXmPnNFquwWym1oFBZ+yAItubz+TMtAJ4gon3pdLo7k8nMNgHYP7ZeE5EWkbuYeaYx0NjY2HXValUDeApAV4zIJIADzPxe+H2hULg+lUp9U6sBl3qLprugXC6nKpXKF0R02nGcZ2wQ3/e3ichOEckQ0aoEWQDbsgF4a3p6eqLeH3qeN0FE3el0ujeTyVTrcaKuY1uIjIg8CaCfiLYnEW1hY4WPi8gEgMeY+e1G27iGxHYxtptZynGYmTPhgK1asqWEiBRfcAjDdMaYpYCIFW8LUMuM54nIsb3/YvbDXskiYtuzA6382n4X1CDWAnCSgNSFa98ETakcWbwWMytjzAoAPUEQ3JBKpXrs75r/VLVanVJK/VC7Uf9KGjfRCiQN9n/slh3gHz9i4jC+FVL5AAAAAElFTkSuQmCC',
      commentData: null,
      placeholder: '请输入评论',
      commentReq: {
        pId: null, // 评论父id
        content: null, // 评论内容
        toId: null, // 被回复评论的id
      },
      pUser: null, // 标签-回复人
      showTag: false, // 标签展示与否
      focus: false, // 输入框自动聚焦
      submit: false, // 弹出评论
      KeyboardHeight: 0, // 键盘高度
    }
  },
  mounted: function () {
    uni.onKeyboardHeightChange((res) => {
      this.KeyboardHeight = res.height
    })
  },
  methods: {
    init(cmData) {
      this.commentData = cmData
    },
    // 没用的方法，但不要删
    stopPrevent() {},
    // 回复评论
    reply(pUser, reUser, pId, reCommentId) {
      this.pUser = pUser
      this.commentReq.pId = pId
      this.commentReq.toId = reCommentId
      if (reUser) {
        this.commentReq.content = '@' + reUser + ' '
      } else {
        this.commentReq.content = ''
      }
      this.showTag = true
      this.commentInput()
    },
    // 删除评论前确认
    confirmDelete(commentId) {
      var that = this
      uni.showModal({
        title: '警告',
        content: that.deleteTip,
        confirmText: '确认删除',
        success: function (res) {
          if (res.confirm) {
            that.$emit('del', commentId)
          }
        },
      })
    },
    // 新增评论
    add() {
      if (
        this.commentReq.content == null ||
        this.commentReq.content.length < 2
      ) {
        uni.showToast({
          title: '评论内容过短',
          duration: 2000,
        })
        return
      }
      this.$emit('add', this.commentReq)
    },
    // 点赞评论
    like(commentId) {
      this.$emit('like', commentId)
    },
    // 新增完成
    addComplete() {
      this.commentReq.content = null
      this.tagClose()
      this.closeInput()
    },
    // 点赞完成-本地修改点赞结果
    likeComplete(commentId) {
      for (var i in this.commentData.comment) {
        if (this.commentData.comment[i].id == commentId) {
          this.commentData.comment[i].hasLike
            ? this.commentData.comment[i].likeCount--
            : this.commentData.comment[i].likeCount++
          this.commentData.comment[i].hasLike =
            !this.commentData.comment[i].hasLike
          return
        }
        for (var j in this.commentData.comment[i].children) {
          if (this.commentData.comment[i].children[j].id == commentId) {
            this.commentData.comment[i].children[j].hasLike
              ? this.commentData.comment[i].children[j].likeCount--
              : this.commentData.comment[i].children[j].likeCount++
            this.commentData.comment[i].children[j].hasLike =
              !this.commentData.comment[i].children[j].hasLike
            return
          }
        }
      }
    },
    // 删除完成-本地删除评论
    deleteComplete(commentId) {
      for (var i in this.commentData.comment) {
        for (var j in this.commentData.comment[i].children) {
          if (this.commentData.comment[i].children[j].id == commentId) {
            this.commentData.comment[i].children.splice(Number(j), 1)
            return
          }
        }
        if (this.commentData.comment[i].id == commentId) {
          this.commentData.comment.splice(Number(i), 1)
          return
        }
      }
    },
    // 展开评论
    showMore(commentId) {
      for (var i in this.commentData.comment) {
        if (this.commentData.comment[i].id == commentId) {
          this.commentData.comment[i].hasShowMore =
            !this.commentData.comment[i].hasShowMore
          this.$forceUpdate()
          return
        }
        for (var j in this.commentData.comment[i].children) {
          if (this.commentData.comment[i].children[j].id == commentId) {
            this.commentData.comment[i].children[j].hasShowMore =
              !this.commentData.comment[i].children[j].hasShowMore
            this.$forceUpdate()
            return
          }
        }
      }
    },
    // 输入框失去焦点
    blur() {
      this.focus = false
    },
    // 输入框聚焦
    focusOn() {
      this.$emit('focusOn')
    },
    // 标签关闭
    tagClose() {
      this.showTag = false
      this.pUser = null
      this.commentReq.pId = null
      this.commentReq.toId = null
    },
    // 输入评论
    commentInput() {
      // TODO 调起键盘方法
      this.submit = true
      setTimeout(() => {
        this.focus = true
      }, 50)
    },
    // 关闭输入评论
    closeInput() {
      this.focus = false
      this.submit = false
    },
  },
}
</script>
