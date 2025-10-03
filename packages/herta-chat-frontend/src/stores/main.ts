import { ref, computed, onMounted } from 'vue';
import { acceptHMRUpdate, defineStore } from 'pinia';
import type { T_Message, T_ReasoningEffort, T_Room } from '@/scripts/types';
import { watch } from 'vue';
import pangu from 'pangu';
import { Snackbar } from '@varlet/ui';
import type { T_Model } from '@/scripts/types-model';
import { useSyncStore } from './sync';

const syncStore = useSyncStore();

let abortController = null as AbortController | null;
export const useMainStore = defineStore('main', () => {
  const chatRooms = ref<T_Room[]>([]);
  const currentRoomID = ref('');
  const currentRoom = computed(() => {
    return chatRooms.value.find((room) => room.uuid === currentRoomID.value);
  });
  const currentModel = computed(() => {
    return models.value.find(
      (model) => model.id === currentRoom.value?.config.model
    );
  });
  const apiKey = ref('');
  const models = ref<T_Model[]>([]);
  const isLoading = ref(false);
  const enablePangu = ref(false);
  const reasoning = ref<T_ReasoningEffort | false>(false);

  onMounted(() => {
    const savedApiKey = localStorage.getItem('HertaChat:apiKey');
    const savedRooms = localStorage.getItem('HertaChat:rooms');

    if (savedApiKey) {
      apiKey.value = savedApiKey;
      fetchModels();
    }
    if (savedRooms) {
      chatRooms.value = JSON.parse(savedRooms);
    }
  });

  watch(apiKey, (newApiKey) => {
    if (newApiKey) {
      localStorage.setItem('HertaChat:apiKey', newApiKey);
    } else {
      localStorage.removeItem('HertaChat:apiKey');
    }
  });

  watch(
    () => currentRoom.value?.config.model,
    (newModel) => {
      saveData();
    }
  );

  async function fetchModels() {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey.value}`
        }
      });

      if (!response.ok) {
        throw new Error(`获取模型失败: ${response.statusText}`);
      }

      const data = await response.json();
      models.value = data.data || ([] as T_Model[]);
    } catch (error) {
      console.error('获取模型时出错:', error);
      alert('获取模型失败，请检查API密钥是否正确');
    }
  }

  const deleteMessage = (index: number) => {
    if (!currentRoom.value) return;
    if (index < 0 || index >= currentRoom.value?.messages.length) return;
    currentRoom.value.messages = [
      ...currentRoom.value.messages.slice(0, index),
      ...currentRoom.value.messages.slice(index + 1)
    ];
    saveData();
  };

  const saveData = () => {
    if (!chatRooms.value) return;
    return localStorage.setItem(
      'HertaChat:rooms',
      JSON.stringify(chatRooms.value)
    );
  };
  const abortRequest = () => {
    saveData();
    isLoading.value = false;
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  const createRoom = () => {
    chatRooms.value.push({
      uuid: crypto.randomUUID(),
      name: '新房间',
      messages: [],
      config: {
        model: ''
      },
      modify: new Date().getTime()
    });
  };

  async function sendMessage(message: string) {
    if (!message.trim() || isLoading.value) return;
    if (!currentRoom.value) {
      Snackbar.error('请选择一个房间');
      return;
    }
    currentRoom.value.modify = new Date().getTime();
    currentRoom.value.messages.push({
      role: 'user',
      content: message.trim()
    });
    const userMessage = message;
    message = '';
    isLoading.value = true;
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://herta-chat.sharpdotnut.com/',
            'X-Title': 'Herta Chat',
            Authorization: `Bearer ${apiKey.value}`
          },
          body: JSON.stringify({
            model: currentRoom.value.config.model,
            messages: [
              ...currentRoom.value.messages.map((m) => ({
                role: m.role,
                content: m.content
              })),
              { role: 'user', content: userMessage }
            ],
            reasoning: reasoning.value
              ? {
                  effort: reasoning.value
                }
              : null,
            stream: true
          }),
          signal: abortController.signal
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(`请求失败: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      currentRoom.value.messages.push({
        role: 'assistant',
        content: '',
        reasoning: reasoning.value ? '' : undefined
      });
      let currentMessage = '';
      let currentReasoning = '';
      const last2ndMessage =
        currentRoom.value.messages[currentRoom.value.messages.length - 2];
      const lastMessage =
        currentRoom.value.messages[currentRoom.value.messages.length - 1]!;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          isLoading.value = false;
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices[0].delta.content) {
                currentMessage += data.choices[0].delta.content;
                if (enablePangu.value) {
                  currentMessage = pangu.spacingText(currentMessage);
                }
                lastMessage.content = currentMessage;
              }
              if (data.choices && data.choices[0].delta.reasoning) {
                currentReasoning += data.choices[0].delta.reasoning;
                if (enablePangu.value) {
                  currentReasoning = pangu.spacingText(currentReasoning);
                }
                lastMessage.reasoning = currentReasoning;
              }
              if (data.usage) {
                if (last2ndMessage && last2ndMessage.role == 'user') {
                  last2ndMessage.tokens = data.usage.prompt_tokens;
                }
                lastMessage.tokens = data.usage.completion_tokens;
              }
            } catch (e) {
              console.error('解析流数据时出错:', e);
            }
          }
        }
      }
      saveData();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求被取消');
      } else {
        console.error('发送消息时出错:', error);
        alert('发送消息失败，请检查API密钥和网络连接');
      }
    }
    isLoading.value = false;
    currentRoom.value.modify = new Date().getTime();
  }

  const sync = async (type: 'pull' | 'push') => {
    if (type === 'pull') {
      const data = await syncStore.getData();
      if (data) {
        apiKey.value = data.apiKey;
        chatRooms.value = data.rooms;
      } else {
        Snackbar.error('同步失败');
      }
    } else {
      syncStore
        .postData({
          apiKey: apiKey.value,
          rooms: chatRooms.value
        })
        .then(() => {
          Snackbar.success('同步成功');
        })
        .catch((e) => {
          Snackbar.error('同步失败');
        });
    }
  };

  return {
    chatRooms,
    currentRoomID,
    apiKey,
    models,
    isLoading,
    reasoning,
    enablePangu,
    currentRoom,
    currentModel,
    fetchModels,
    deleteMessage,
    abortRequest,
    sendMessage,
    createRoom,
    sync
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot));
}
