<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <var-app-bar> Herta Chat </var-app-bar>
    <RouterView id="container" />
  </div>
</template>

<style lang="css" scoped>
@import url('./App.css');
</style>
