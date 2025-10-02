import { ref, computed, onMounted } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import type { T_Message } from '@/types/main'
import { watch } from 'vue'

let abortController = null as AbortController | null
export const useMainStore = defineStore('main', () => {
  const apiKey = ref('')
  const models = ref<any[]>([])
  const selectedModel = ref('')
  const messages = ref<T_Message[]>([])
  const isLoading = ref(false)

  onMounted(() => {
    const savedApiKey = localStorage.getItem('HertaChat:apiKey')
    const savedModel = localStorage.getItem('HertaChat:selectedModel')
    const savedMessages = localStorage.getItem('HertaChat:messages')

    console.log('从localStorage加载数据:', savedApiKey, savedModel, savedMessages)
    if (savedApiKey) {
      apiKey.value = savedApiKey
      fetchModels()
    }
    if (savedModel) {
      selectedModel.value = savedModel
    }
    if (savedMessages) {
      messages.value = JSON.parse(savedMessages)
    }
  })

  watch(apiKey, (newApiKey) => {
    if (newApiKey) {
      localStorage.setItem('HertaChat:apiKey', newApiKey)
    } else {
      localStorage.removeItem('HertaChat:apiKey')
    }
  })

  watch(selectedModel, (newModel) => {
    if (newModel) {
      localStorage.setItem('HertaChat:selectedModel', newModel)
    } else {
      localStorage.removeItem('HertaChat:selectedModel')
    }
  })
  async function fetchModels() {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey.value}`,
        },
      })

      if (!response.ok) {
        throw new Error(`获取模型失败: ${response.statusText}`)
      }

      const data = await response.json()
      models.value = data.data || []
    } catch (error) {
      console.error('获取模型时出错:', error)
      alert('获取模型失败，请检查API密钥是否正确')
    }
  }
  async function sendMessage(message: string) {
    if (!message.trim() || isLoading.value) return

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: message.trim(),
    })

    const userMessage = message
    message = ''
    isLoading.value = true

    // 如果有之前的请求，取消它
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://herta-chat.sharpdotnut.com/',
          'X-Title': 'Herta Chat',
          Authorization: `Bearer ${apiKey.value}`,
        },
        body: JSON.stringify({
          model: selectedModel.value,
          messages: [
            ...messages.value.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
          ],
          stream: true,
        }),
        signal: abortController.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(`请求失败: ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      // 添加一个空的助手消息用于流式渲染
      messages.value.push({
        role: 'assistant',
        content: '',
      })
      const lastMessage = messages.value[messages.value.length - 1]!

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          isLoading.value = false
          break
        }

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.choices && data.choices[0].delta.content) {
                assistantMessage += data.choices[0].delta.content
                lastMessage.content = assistantMessage
              }
            } catch (e) {
              console.error('解析流数据时出错:', e)
            }
          }
        }
      }
      localStorage.setItem('HertaChat:messages', JSON.stringify(messages.value))
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求被取消')
      } else {
        console.error('发送消息时出错:', error)
        alert('发送消息失败，请检查API密钥和网络连接')
      }
    }
    isLoading.value = false
  }

  return {
    apiKey,
    models,
    selectedModel,
    messages,
    isLoading,
    fetchModels,
    sendMessage,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot))
}
