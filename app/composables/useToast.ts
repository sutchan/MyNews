// app/composables/useToast.ts v2.0.0
import { ref, computed } from 'vue'

// 通知类型
export type ToastType = 'success' | 'error' | 'warning' | 'info'

// 通知项接口
export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration: number
  createdAt: number
}

// 通知服务配置
export interface ToastConfig {
  defaultDuration?: number
  maxVisibleToasts?: number
}

/**
 * 系统通知服务
 * 提供全局消息通知功能，支持多种类型的通知和自动消失
 */
export function useToast(config: ToastConfig = {}) {
  // 配置默认值
  const defaultDuration = config.defaultDuration || 3000
  const maxVisibleToasts = config.maxVisibleToasts || 5
  
  // 通知列表
  const toasts = ref<ToastItem[]>([])
  
  // 可见的通知（限制数量）
  const visibleToasts = computed(() => {
    return toasts.value.slice(0, maxVisibleToasts)
  })
  
  // 生成唯一ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  // 添加通知
  const addToast = (message: string, type: ToastType = 'info', duration: number = defaultDuration): ToastItem => {
    const toast: ToastItem = {
      id: generateId(),
      message,
      type,
      duration,
      createdAt: Date.now()
    }
    
    // 添加到列表开头（新通知显示在最上面）
    toasts.value.unshift(toast)
    
    // 设置自动关闭
    if (duration > 0) {
      setTimeout(() => {
        removeToast(toast.id)
      }, duration)
    }
    
    return toast
  }
  
  // 移除通知
  const removeToast = (id: string): void => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  // 清除所有通知
  const clearAllToasts = (): void => {
    toasts.value = []
  }
  
  // 快捷方法：成功通知
  const success = (message: string, duration?: number): ToastItem => {
    return addToast(message, 'success', duration)
  }
  
  // 快捷方法：错误通知
  const error = (message: string, duration?: number): ToastItem => {
    return addToast(message, 'error', duration)
  }
  
  // 快捷方法：警告通知
  const warning = (message: string, duration?: number): ToastItem => {
    return addToast(message, 'warning', duration)
  }
  
  // 快捷方法：信息通知
  const info = (message: string, duration?: number): ToastItem => {
    return addToast(message, 'info', duration)
  }
  
  // 获取通知类型对应的CSS类
  const getToastClass = (type: ToastType): string => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
    }
  }
  
  // 获取通知类型对应的图标名称
  const getToastIcon = (type: ToastType): string => {
    switch (type) {
      case 'success':
        return 'CheckCircle'
      case 'error':
        return 'XCircle'
      case 'warning':
        return 'AlertTriangle'
      case 'info':
      default:
        return 'Info'
    }
  }
  
  return {
    toasts: visibleToasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    getToastClass,
    getToastIcon
  }
}

// 创建全局通知服务实例
let globalToast: ReturnType<typeof useToast> | null = null

/**
 * 获取全局通知服务实例
 * 单例模式，确保应用中只有一个通知服务
 */
export function useGlobalToast() {
  if (!globalToast) {
    globalToast = useToast()
  }
  return globalToast
}
