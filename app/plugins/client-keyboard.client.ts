// 客户端专用的键盘快捷键处理插件
export default defineNuxtPlugin(() => {
  // 全局键盘快捷键处理
  const handleGlobalKeydown = (event: KeyboardEvent) => {
    // Cmd+K 或 Ctrl+K 打开全局搜索
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      // 触发全局搜索事件
      window.dispatchEvent(new CustomEvent('open-global-search'))
    }
  }

  // 添加全局键盘事件监听器
  document.addEventListener('keydown', handleGlobalKeydown)
}) 