import { Snackbar } from '@varlet/ui'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'
import { useMainStore } from './main'
import type { T_Room } from '@/scripts/types'

export const useSyncStore = defineStore('sync', () => {
  const url = ref('')
  const token = ref('')
  url.value = localStorage.getItem('HertaChat:syncUrl') || ''
  token.value = localStorage.getItem('HertaChat:syncToken') || ''
  watchEffect(() => {
    localStorage.setItem('HertaChat:syncUrl', url.value)
    localStorage.setItem('HertaChat:syncToken', token.value)
  })

  const getData = async () => {
    const response = await fetch(url.value, {
      method: 'GET',
      headers: {
        Authorization: token.value,
      },
    })
    if (response.status != 200) {
      alert('获取数据失败，请检查URL和TOKEN是否正确')
      return
    } else {
      Snackbar.success('获取数据成功')
    }
    const data = (await response.json()) as {
      apiKey: string
      rooms: T_Room[]
    }
    return data
  }

  const postData = async (data: { apiKey: string; rooms: T_Room[] }) => {
    const response = await fetch(url.value, {
      method: 'POST',
      headers: {
        Authorization: token.value,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (response.status != 200) {
      alert('上传数据失败，请检查URL和TOKEN是否正确')
    }
  }

  return { url, token, getData, postData }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSyncStore, import.meta.hot))
}
