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

watch(
  () => props.content,
  (newValue) => {
    renderedContent.value = MDIT.render(newValue)
    nextTick(() => {
      if (!contentElement.value) return
      morphdom(contentElement.value, `<div>${renderedContent.value}</div>`, {
        childrenOnly: true,
      })
      hljs.highlightAll()
    })
  },
  { immediate: true },
)

import 'github-markdown-css/github-markdown-light.css'
</script>

<style scoped>
.markdown-body {
  background-color: transparent !important;
  font-family: inherit;
}
</style>
