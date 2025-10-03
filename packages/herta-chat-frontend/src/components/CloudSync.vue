<script setup lang="ts">
import { useSyncStore } from '@/stores/sync'

const syncStore = useSyncStore()
const show = defineModel({
  type: Boolean,
  required: true,
})
</script>

<template>
  <var-dialog v-model:show="show">
    <template #title>配置云同步参数</template>
    <br />
    <var-input placeholder="服务器 URL" v-model="syncStore.url" />
    <br />
    <var-input placeholder="TOKEN" v-model="syncStore.token" />"
    <var-button @click="syncStore.getData()" type="primary" block>测试连接</var-button>
  </var-dialog>
</template>
