<script setup lang="ts">
import { useMainStore } from '@/stores/main';
import { useSyncStore } from '@/stores/sync';

const store = useMainStore();
const syncStore = useSyncStore();
</script>

<template>
  <div class="container-setting">
    <h3>API 密钥</h3>
    <var-input
      class="grow"
      v-model="store.apiKey"
      type="password"
      size="small"
      placeholder="输入您的 OpenRouter API密钥" />
    <var-button
      size="small"
      block
      @click="store.fetchModels"
      :loading="store.isFetchingModels">
      更新模型列表
    </var-button>
    <var-divider />
    <h3>云同步</h3>
    <var-input placeholder="服务器 URL" size="small" v-model="syncStore.url" />
    <var-input placeholder="TOKEN" size="small" v-model="syncStore.token" />
    <var-button @click="syncStore.getData()" size="small" block>
      测试连接
    </var-button>
    <var-divider />
    <h3>预设</h3>
    <p>
      <var-link
        type="primary"
        href="https://openrouter.ai/docs/features/presets"
        target="_blank">
        关于预设
      </var-link>
      <span>&nbsp;|&nbsp;</span>
      <var-link
        type="primary"
        href="https://openrouter.ai/settings/presets"
        target="_blank">
        配置预设
      </var-link>
    </p>
    <var-input v-model="store.preset" size="small" placeholder="输入预设 ID" />
  </div>
</template>

<style lang="css" scoped>
.container-setting {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
