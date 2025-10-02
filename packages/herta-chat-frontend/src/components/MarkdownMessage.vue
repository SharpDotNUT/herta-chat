<template>
  <div>
    <div class="message-content markdown-body" ref="contentElement"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, useTemplateRef } from 'vue'
import MarkdownIt from 'markdown-it'
import morphdom from 'morphdom'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
})

const MDIT = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
const contentElement = useTemplateRef('contentElement')
const renderedContent = ref('')

const highlight = () => {
  throttle(() => {
    if (!contentElement.value) return
    hljs.highlightElement(contentElement.value)
  }, 5000)
}

watch(
  () => props.content,
  (newValue) => {
    renderedContent.value = MDIT.render(newValue)
    nextTick(() => {
      if (!contentElement.value) return
      morphdom(contentElement.value, `<div>${renderedContent.value}</div>`, {
        childrenOnly: true,
      })
      highlight()
    })
  },
  { immediate: true },
)

import 'github-markdown-css/github-markdown-light.css'
import { throttle } from 'es-toolkit'
</script>

<style scoped>
.markdown-body {
  background-color: transparent !important;
  font-family: inherit;
}
</style>
