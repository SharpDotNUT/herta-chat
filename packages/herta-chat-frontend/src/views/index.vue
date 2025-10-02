<script setup lang="ts">
import { ref, onMounted, watch, nextTick, useTemplateRef } from 'vue'
import MarkdownMessage from '@/components/MarkdownMessage.vue'
import { useMainStore } from '@/stores/main'
import { ReasoningEfforts } from '@/scripts/types'
import { copyToClipboard } from '@/scripts/uiltsMain'

const store = useMainStore()
const userInput = ref('')
const chatContainer = useTemplateRef('chatContainer')

const saveMessages = () => {
  localStorage.setItem('HertaChat:messages', JSON.stringify(store.messages))
}
</script>

<template>
  <div class="container-home">
    <div class="header">
      <div id="api-key">
        <var-input
          id="api-key-input"
          v-model="store.apiKey"
          type="password"
          size="small"
          placeholder="输入您的OpenRouter API密钥"
        />
        <var-button @click="store.fetchModels" :disabled="!store.apiKey">获取模型</var-button>
      </div>
      <br />
      <var-select
        v-if="store.models.length > 0"
        placeholder="选择模型"
        v-model="store.selectedModel"
        size="small"
        id="model"
      >
        <var-option
          v-for="model in store.models"
          :key="model.id"
          :value="model.id"
          :label="model.name || model.id"
        >
        </var-option>
      </var-select>
    </div>
    <div id="chat-messages" ref="chatContainer">
      <div v-for="(message, index) in store.messages" :key="index">
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
            <var-button
              text
              round
              @click="
                ((store.messages = [
                  ...store.messages.slice(0, index),
                  ...store.messages.slice(index + 1),
                ]),
                saveMessages())
              "
            >
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
    <div id="chat-input">
      <var-input
        id="input"
        textarea
        rows="4"
        v-model="userInput"
        placeholder="输入您的消息..."
        @keydown.enter.prevent="store.sendMessage"
        :disabled="store.isLoading"
      ></var-input>
      <div id="actions">
        <var-select placeholder="思考模式" v-model="store.reasoning">
          <var-option :value="false" label="none" />
          <var-option v-for="effort in ReasoningEfforts" :value="effort" :label="effort" />
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
  </div>
</template>

<style scoped>
@import url('./index.css');
</style>
