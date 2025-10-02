<script setup lang="ts">
import { ref, onMounted, watch, nextTick, useTemplateRef } from 'vue'
import MarkdownMessage from '@/components/MarkdownMessage.vue'
import { useMainStore } from '@/stores/main'

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
          <MarkdownMessage :content="message.content" />
          <var-button text round>
            <var-icon
              name="delete"
              @click="
                ((store.messages = [
                  ...store.messages.slice(0, index),
                  ...store.messages.slice(index + 1),
                ]),
                saveMessages())
              "
            />
          </var-button>
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
      <var-button
        @click="store.sendMessage(userInput)"
        type="primary"
        :disabled="store.isLoading || !userInput.trim()"
        >发送</var-button
      >
    </div>
  </div>
</template>

<style scoped>
@import url('./index.css');
</style>
