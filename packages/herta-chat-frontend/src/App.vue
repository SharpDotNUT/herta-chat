<script setup lang="ts">
import { RouterView } from 'vue-router';
import PackageJSON from '../../../package.json';
import Setting from './components/Setting.vue';
import { ref } from 'vue';

const showSetting = ref(false);
</script>

<template>
  <div id="app">
    <var-app-bar>
      Herta Chat
      <span>&nbsp;|&nbsp;</span>
      <span>v{{ PackageJSON.version }}</span>
      <template #right>
        <var-button text round @click="showSetting = true">
          <var-icon name="cog" />
        </var-button>
        <var-dialog v-model:show="showSetting" title="设置">
          <Setting />
        </var-dialog>
      </template>
    </var-app-bar>
    <RouterView id="container" />
  </div>
</template>

<style lang="css" scoped>
@import url('./App.css');
</style>
