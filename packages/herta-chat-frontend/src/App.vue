<script setup lang="ts">
import { RouterView } from 'vue-router'
import PackageJSON from '../../../package.json'
</script>

<template>
  <div id="app">
    <var-app-bar>
      Herta Chat
      <span>&nbsp;|&nbsp;</span>
      <span> v{{ PackageJSON.version }} </span>
    </var-app-bar>
    <RouterView id="container" />
  </div>
</template>

<style lang="css" scoped>
@import url('./App.css');
</style>
