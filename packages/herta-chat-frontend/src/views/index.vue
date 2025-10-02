<script setup lang="ts">
import { ref, onMounted, watch, nextTick, useTemplateRef } from 'vue'
import MarkdownMessage from '@/components/MarkdownMessage.vue'
import { useMainStore } from '@/stores/main'
import { ReasoningEfforts } from '@/scripts/types'
import { copyToClipboard } from '@/scripts/uiltsMain'
import ChatRooms from '@/components/ChatRooms.vue'
import { computed } from 'vue'

const store = useMainStore()
const userInput = ref('')
const chatContainer = useTemplateRef('chatContainer')
const freeOnly = ref(false)
const models = computed(() => {
  return store.models.filter((model) => {
    return !freeOnly.value || model.id.endsWith(':free')
  })
})
</script>

<template>
  <div class="container-home">
    <div id="rooms">
      <ChatRooms />
    </div>
    <div id="main">
      <div class="header">
        <div id="api-key">
          <var-input
            class="grow"
            v-model="store.apiKey"
            type="password"
            size="small"
            placeholder="输入您的OpenRouter API密钥"
          />
          <var-button @click="store.fetchModels" :disabled="!store.apiKey">获取模型</var-button>
        </div>
        <br v-if="store.currentRoom" />
        <div v-if="store.currentRoom" id="model-section">
          <var-select
            class="grow"
            placeholder="选择模型"
            v-model="store.currentRoom.config.model"
            size="small"
            id="model"
          >
            <var-option
              v-for="model in models"
              :key="model.id"
              :value="model.id"
              :label="model.name || model.id"
            >
            </var-option>
          </var-select>
          <p id="free-only"><var-checkbox v-model="freeOnly" /><span>只看免费</span></p>
        </div>
      </div>
      <div v-if="store.currentRoom && store.currentModel" id="chat-messages" ref="chatContainer">
        <div v-for="(message, index) in store.currentRoom?.messages" :key="index">
          <div
            class="message-content"
            :class="{
              user: message.role === 'user',
              assistant: message.role === 'assistant',
            }"
          >
            <template v-if="message.reasoning">
              <MarkdownMessage class="reasoning" :content="message.reasoning" />
              <br />
            </template>
            <MarkdownMessage :content="message.content" />
            <var-divider />
            <div>
              <var-button text round @click="store.deleteMessage(index)">
                <var-icon name="delete" />
              </var-button>
              <var-button text round @click="copyToClipboard(message.content)">
                <var-icon name="content-copy" />
              </var-button>
              <span v-if="message.tokens"> {{ message.tokens }} tokens | </span>
              <span v-if="message.reasoning"> {{ message.reasoning.length }} 思考字符 | </span>
              <span>{{ message.content.length }} 字符</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="store.currentRoom && store.currentModel" id="chat-input">
        <var-input
          id="input"
          textarea
          rows="6"
          v-model="userInput"
          placeholder="输入您的消息..."
          @keydown.enter.prevent="store.sendMessage"
          :disabled="store.isLoading"
        ></var-input>
        <div id="actions">
          <var-select
            v-if="store.currentModel?.supported_parameters?.includes('reasoning')"
            size="small"
            placeholder="思考模式"
            v-model="store.reasoning"
          >
            <var-option :value="false" label="none" />
            <var-option v-for="effort in ReasoningEfforts" :value="effort" :label="effort" />
          </var-select>
          <var-select size="small" placeholder="启用盘古" v-model="store.enablePangu">
            <var-option :value="false" label="禁用" />
            <var-option :value="true" label="启用" />
          </var-select>
          <var-button
            v-if="!store.isLoading"
            block
            @click="store.sendMessage(userInput)"
            type="primary"
            :disabled="!userInput.trim()"
            >发送</var-button
          >
          <var-button v-else block @click="store.abortRequest" type="danger">停止</var-button>
        </div>
      </div>
      <div v-else id="tip">
        <div v-if="!store.currentRoom">
          <p>请选择一个房间开始聊天</p>
          <br />
          <var-button block @click="store.createRoom">创建新房间</var-button>
        </div>
        <p v-else>请选择一个模型</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('./index.css');
</style>
