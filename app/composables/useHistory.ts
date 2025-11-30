// 用户阅读历史相关的组合式函数

import { ref, computed, onMounted } from 'vue'
import { useGlobalToast } from './useToast'
import { useAuth } from './useAuth'
import type { NewsItem } from '@/api/news'
import { API_CONFIG, API_ENDPOINTS, type ApiResponse } from '@/api/config'

// 阅读历史项类型
interface HistoryItem extends NewsItem {
  platform: string
  platformTitle: string
  readAt: number
  readDuration?: number // 阅读时长（毫秒）
  lastReadAt?: number   // 最后阅读时间
  readCount?: number    // 阅读次数
}

// 本地存储的键名
const HISTORY_STORAGE_KEY = 'news-history'

// 最大历史记录数量
const MAX_HISTORY_ITEMS = 500

// 阅读历史列表
const history = ref<HistoryItem[]>([])

// 加载状态
const isLoading = ref(false)

// 从本地存储加载历史记录 - SSR兼容版本
const loadHistory = () => {
  // 只在客户端执行
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (stored) {
        history.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('加载阅读历史失败:', e)
      history.value = []
    }
  }
}

// 保存历史记录到本地存储 - SSR兼容版本
const saveHistory = () => {
  // 只在客户端执行
  if (import.meta.client) {
    try {
      // 限制历史记录数量
      if (history.value.length > MAX_HISTORY_ITEMS) {
        history.value = history.value.slice(0, MAX_HISTORY_ITEMS)
      }
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.value))
    } catch (e) {
      console.error('保存阅读历史失败:', e)
    }
  }
}

// 从服务器获取历史记录
const fetchHistoryFromServer = async () => {
  const { authState } = useAuth()
  if (!authState.value.isLoggedIn || !authState.value.token) {
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.userHistory}`, {
      headers: {
        'Authorization': `Bearer ${authState.value.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<HistoryItem[]> = await response.json()
    if (result.code === 200 && result.data) {
      history.value = result.data
      saveHistory()
    }
  } catch (err) {
    console.error('从服务器获取历史记录失败:', err)
    // 失败时使用本地存储数据
    loadHistory()
  } finally {
    isLoading.value = false
  }
}

// 通用请求函数
const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const { authState } = useAuth()
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  }
  
  if (authState.value.token) {
    headers['Authorization'] = `Bearer ${authState.value.token}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const result: ApiResponse<T> = await response.json()
  
  if (result.code === 200) {
    return result.data
  } else {
    throw new Error(result.msg || '请求失败')
  }
}

/**
 * 添加或更新阅读历史
 * @param item 新闻项目
 * @param platform 平台标识
 * @param platformTitle 平台标题
 * @param duration 阅读时长（可选）
 */
const addToHistory = async (item: NewsItem, platform: string = '', platformTitle: string = '', duration?: number) => {
  const now = Date.now()
  
  // 查找是否已存在该项目
  const existingIndex = history.value.findIndex(h => h.id === item.id)
  
  let historyItem: HistoryItem
  
  if (existingIndex >= 0) {
    // 更新现有项目
    const existing = history.value[existingIndex]
    historyItem = {
      ...existing,
      ...item, // 更新新闻项目数据
      lastReadAt: now,
      readCount: (existing.readCount || 0) + 1,
      readDuration: duration || existing.readDuration
    }
    
    // 将更新的项目移到最前面
    history.value.splice(existingIndex, 1)
    history.value.unshift(historyItem)
  } else {
    // 添加新项目
    historyItem = {
      ...item,
      platform,
      platformTitle,
      readAt: now,
      lastReadAt: now,
      readCount: 1,
      readDuration: duration
    }
    
    // 添加到列表开头
    history.value.unshift(historyItem)
    
    // 保持列表在限制大小内
    if (history.value.length > MAX_HISTORY_ITEMS) {
      history.value.pop()
    }
  }
  
  // 保存到本地存储
  saveHistory()
  
  // 如果已登录，同步到服务器
  const { authState } = useAuth()
  if (authState.value.isLoggedIn) {
    try {
      await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.addHistory}`, {
        method: 'POST',
        body: JSON.stringify(historyItem)
      })
    } catch (err) {
      console.error('同步历史记录到服务器失败:', err)
      // 同步失败时不影响本地状态
    }
  }
}

/**
 * 从历史记录中移除项目
 * @param itemId 项目ID
 */
const removeFromHistory = async (itemId: string) => {
  const index = history.value.findIndex(h => h.id === itemId)
  if (index >= 0) {
    // 更新本地状态
    history.value.splice(index, 1)
    saveHistory()
    
    // 如果已登录，同步到服务器
    const { authState } = useAuth()
    if (authState.value.isLoggedIn) {
      try {
        await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.removeHistory}`, {
          method: 'DELETE',
          body: JSON.stringify({ id: itemId })
        })
      } catch (err) {
        console.error('从服务器移除历史记录失败:', err)
        // 同步失败时不影响本地状态
      }
    }
  }
}

/**
 * 清空阅读历史
 */
const clearHistory = async () => {
  // 更新本地状态
  history.value = []
  saveHistory()
  
  // 如果已登录，同步到服务器
  const { authState } = useAuth()
  if (authState.value.isLoggedIn) {
    try {
      await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.clearHistory}`, {
        method: 'DELETE'
      })
    } catch (err) {
      console.error('清空服务器历史记录失败:', err)
    }
  }
}

/**
 * 检查项目是否已在阅读历史中
 * @param item 新闻项目
 * @returns 是否已阅读
 */
const hasRead = (item: NewsItem): boolean => {
  return history.value.some(h => h.id === item.id)
}

/**
 * 获取最近阅读的项目
 * @param limit 限制数量
 * @returns 最近阅读的项目列表
 */
const getRecentHistory = (limit: number = 10): HistoryItem[] => {
  return history.value.slice(0, limit)
}

/**
 * 按日期分组获取阅读历史
 * @returns 按日期分组的历史记录
 */
const getHistoryByDate = (): Record<string, HistoryItem[]> => {
  const grouped: Record<string, HistoryItem[]> = {}
  
  history.value.forEach(item => {
    const date = new Date(item.readAt).toISOString().split('T')[0]
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(item)
  })
  
  // 对每个日期组内的项目按添加时间排序（最新的在前）
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => b.readAt - a.readAt)
  })
  
  return grouped
}

/**
 * 搜索历史记录
 * @param query 搜索关键词
 * @returns 匹配的历史记录
 */
const searchHistory = (query: string): HistoryItem[] => {
  const lowercaseQuery = query.toLowerCase()
  return history.value.filter(item => 
    item.title?.toLowerCase().includes(lowercaseQuery) ||
    item.content?.toLowerCase().includes(lowercaseQuery) ||
    item.platformTitle?.toLowerCase().includes(lowercaseQuery)
  )
}

export function useHistory() {
  // 使用全局通知服务
  const { info, success, error } = useGlobalToast()
  const { authState } = useAuth()
  
  // 在客户端初始化时加载历史数据
  onMounted(() => {
    if (authState.value.isLoggedIn) {
      fetchHistoryFromServer()
    } else {
      loadHistory()
    }
  })

  // 历史记录数量
  const historyCount = computed(() => history.value.length)

  // 按时间排序的历史记录（最新的在前）
  const sortedHistory = computed(() => {
    return [...history.value].sort((a, b) => b.readAt - a.readAt)
  })

  // 初始化加载
  if (history.value.length === 0 && import.meta.client) {
    loadHistory()
  }

  // 包装通知方法
  const wrappedRemoveFromHistory = async (itemId: string) => {
    await removeFromHistory(itemId)
    if (import.meta.client) {
      info('已从历史记录中移除')
    }
  }
  
  const wrappedClearHistory = async () => {
    await clearHistory()
    if (import.meta.client) {
      success('历史记录已清空')
    }
  }
  
  const wrappedAddToHistory = async (item: NewsItem, platform: string = '', platformTitle: string = '', duration?: number) => {
    await addToHistory(item, platform, platformTitle, duration)
    // 静默添加，不显示通知
  }
  
  // 刷新历史记录
  const refreshHistory = async () => {
    if (authState.value.isLoggedIn) {
      await fetchHistoryFromServer()
    }
  }
  
  return {
    // 状态
    history: sortedHistory,
    historyCount,
    isLoading,
    
    // 方法
    addToHistory: wrappedAddToHistory,
    removeFromHistory: wrappedRemoveFromHistory,
    clearHistory: wrappedClearHistory,
    hasRead,
    getRecentHistory,
    getHistoryByDate,
    searchHistory,
    refreshHistory
  }
}
