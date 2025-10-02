import { Snackbar } from '@varlet/ui'

export const copyToClipboard = (text: string) => {
  try {
    navigator.clipboard.writeText(text)
    Snackbar.success('复制成功')
  } catch (error) {
    console.error(error)
    Snackbar.error('复制失败')
  }
}
