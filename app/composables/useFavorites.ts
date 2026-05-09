// app/composables/useFavorites.ts v2.0.0
import { ref, computed, onMounted } from 'vue'
import { useGlobalToast } from './useToast'
import { useAuth } from './useAuth'
import type { NewsItem } from '@/api/news'
import { API_CONFIG, API_ENDPOINTS, type ApiResponse } from '@/api/config'

// 收藏项类型，包含额外的元数据
export interface FavoriteItem extends NewsItem {
  platform: string
  platformTitle: string
  addedAt: number
  type: 'single' // 单条新闻
}

// 平台收藏类型
export interface FavoritePlatform {
  platform: string
  platformTitle: string
  addedAt: number
  type: 'platform' // 整个平台
}

// 收藏条目联合类型
export type FavoriteEntry = FavoriteItem | FavoritePlatform

// 本地存储的键名
const FAVORITES_STORAGE_KEY = 'news-favorites'

// 收藏列表
const favorites = ref<FavoriteEntry[]>([])

// 加载状态
const isLoading = ref(false)

// 从本地存储加载收藏 - SSR兼容版本
const loadFavorites = () => {
  // 只在客户端执行
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (stored) {
        favorites.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('加载收藏失败:', err)
      favorites.value = []
    }
  }
}

// 保存收藏到本地存储 - SSR兼容版本
const saveFavorites = () => {
  // 只在客户端执行
  if (import.meta.client) {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites.value))
    } catch (err) {
      console.error('保存收藏失败:', err)
    }
  }
}

// 从服务器获取收藏列表
const fetchFavoritesFromServer = async () => {
  const { authState } = useAuth()
  if (!authState.value.isLoggedIn || !authState.value.token) {
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.userFavorites}`, {
      headers: {
        'Authorization': `Bearer ${authState.value.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<FavoriteEntry[]> = await response.json()
    if (result.code === 200 && result.data) {
      favorites.value = result.data
      saveFavorites()
    }
  } catch (err) {
    console.error('从服务器获取收藏失败:', err)
    // 失败时使用本地存储数据
    loadFavorites()
  } finally {
    isLoading.value = false
  }
}

// 将时间戳转换为日期字符串（YYYY-MM-DD格式）
const getDateString = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toISOString().split('T')[0]
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

export function useFavorites() {
  // 使用全局通知服务
  const { info, success, error } = useGlobalToast()
  const { authState } = useAuth()

  // 在客户端初始化时加载收藏数据
  onMounted(() => {
    if (authState.value.isLoggedIn) {
      fetchFavoritesFromServer()
    } else {
      loadFavorites()
    }
  })

  // 收藏数量
  const favoritesCount = computed(() => favorites.value.length)

  // 检查单条新闻是否已收藏
  const isFavorited = (item: NewsItem) => {
    return favorites.value.some(fav => 
      fav.type === 'single' && 
      (fav as FavoriteItem).id === item.id
    )
  }

  // 通过ID检查单条新闻是否已收藏
  const isFavorite = async (id: string) => {
    return favorites.value.some(fav => 
      fav.type === 'single' && 
      (fav as FavoriteItem).id === id
    )
  }

  // 检查平台是否已收藏
  const isPlatformFavorited = (platform: string) => {
    return favorites.value.some(fav => 
      fav.type === 'platform' && fav.platform === platform
    )
  }

  // 添加到收藏
  const addToFavorites = async (item: NewsItem, platform: string = '', platformTitle: string = '') => {
    if (isFavorited(item)) {
      info && info('该文章已在收藏列表中')
      return false // 已经收藏过了
    }

    const favoriteItem: FavoriteItem = {
      ...item,
      platform,
      platformTitle,
      addedAt: Date.now(),
      type: 'single'
    }

    // 更新本地状态
    favorites.value.unshift(favoriteItem) // 添加到开头
    saveFavorites()
    
    // 如果已登录，同步到服务器
    if (authState.value.isLoggedIn) {
      try {
        await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.addFavorite}`, {
          method: 'POST',
          body: JSON.stringify(favoriteItem)
        })
      } catch (err) {
        console.error('同步收藏到服务器失败:', err)
        // 同步失败时不影响本地状态
      }
    }
    
    success && success('收藏成功')
    return true
  }

  // 从收藏中移除单条新闻
  const removeFromFavorites = async (item: NewsItem) => {
    const index = favorites.value.findIndex(fav => 
      fav.type === 'single' && 
      (fav as FavoriteItem).id === item.id
    )
    
    if (index > -1) {
      // 更新本地状态
      favorites.value.splice(index, 1)
      saveFavorites()
      
      // 如果已登录，同步到服务器
      if (authState.value.isLoggedIn) {
        try {
          await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.removeFavorite}`, {
            method: 'DELETE',
            body: JSON.stringify({ id: item.id })
          })
        } catch (err) {
          console.error('从服务器移除收藏失败:', err)
          // 同步失败时不影响本地状态
        }
      }
      
      info && info('已从收藏中移除')
      return true
    }
    return false
  }

  // 通过ID移除收藏
  const removeFavorite = async (id: string) => {
    const index = favorites.value.findIndex(fav => 
      fav.type === 'single' && 
      (fav as FavoriteItem).id === id
    )
    
    if (index > -1) {
      // 更新本地状态
      favorites.value.splice(index, 1)
      saveFavorites()
      
      // 如果已登录，同步到服务器
      if (authState.value.isLoggedIn) {
        try {
          await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.removeFavorite}`, {
            method: 'DELETE',
            body: JSON.stringify({ id })
          })
        } catch (err) {
          console.error('从服务器移除收藏失败:', err)
        }
      }
      
      info && info('已从收藏中移除')
      return true
    }
    return false
  }

  // 添加平台到收藏
  const addPlatformToFavorites = async (platform: string, platformTitle: string) => {
    if (isPlatformFavorited(platform)) {
      return false // 已经收藏过了
    }

    const favoritePlatform: FavoritePlatform = {
      platform,
      platformTitle,
      addedAt: Date.now(),
      type: 'platform'
    }

    // 更新本地状态
    favorites.value.unshift(favoritePlatform) // 添加到开头
    saveFavorites()
    
    // 如果已登录，同步到服务器
    if (authState.value.isLoggedIn) {
      try {
        await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.addFavorite}`, {
          method: 'POST',
          body: JSON.stringify(favoritePlatform)
        })
      } catch (err) {
        console.error('同步平台收藏到服务器失败:', err)
      }
    }
    
    return true
  }

  // 从收藏中移除平台
  const removePlatformFromFavorites = async (platform: string) => {
    const index = favorites.value.findIndex(fav => 
      fav.type === 'platform' && fav.platform === platform
    )
    
    if (index > -1) {
      // 更新本地状态
      favorites.value.splice(index, 1)
      saveFavorites()
      
      // 如果已登录，同步到服务器
      if (authState.value.isLoggedIn) {
        try {
          await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.removeFavorite}`, {
            method: 'DELETE',
            body: JSON.stringify({ platform })
          })
        } catch (err) {
          console.error('从服务器移除平台收藏失败:', err)
        }
      }
      
      return true
    }
    return false
  }

  // 切换平台收藏状态
  const togglePlatformFavorite = async (platform: string, platformTitle: string) => {
    if (isPlatformFavorited(platform)) {
      const result = await removePlatformFromFavorites(platform)
      if (result) {
        info && info(`已取消收藏平台: ${platformTitle}`)
      }
      return result
    } else {
      const result = await addPlatformToFavorites(platform, platformTitle)
      if (result) {
        success && success(`已收藏平台: ${platformTitle}`)
      }
      return result
    }
  }

  // 切换收藏状态 - 已通过addToFavorites和removeFromFavorites包含通知
  const toggleFavorite = async (item: NewsItem, platform: string = '', platformTitle: string = '') => {
    if (isFavorited(item)) {
      return await removeFromFavorites(item)
    } else {
      return await addToFavorites(item, platform, platformTitle)
    }
  }

  // 清空收藏
  const clearFavorites = async () => {
    // 更新本地状态
    favorites.value = []
    saveFavorites()
    
    // 如果已登录，同步到服务器
    if (authState.value.isLoggedIn) {
      try {
        await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.userFavorites}`, {
          method: 'DELETE'
        })
      } catch (err) {
        console.error('清空服务器收藏失败:', err)
      }
    }
    
    success && success('收藏已清空')
  }

  // 获取收藏列表（按添加时间排序）
  const getFavorites = computed(() => {
    return [...favorites.value].sort((a, b) => b.addedAt - a.addedAt)
  })

  // 初始化加载
  if (favorites.value.length === 0) {
    loadFavorites()
  }

  // 获取单条新闻收藏
  const getNewsItems = computed(() => {
    return favorites.value.filter(fav => fav.type === 'single') as FavoriteItem[]
  })

  // 获取平台收藏
  const getPlatforms = computed(() => {
    return favorites.value.filter(fav => fav.type === 'platform') as FavoritePlatform[]
  })

  // 单条新闻收藏数量
  const newsItemsCount = computed(() => getNewsItems.value.length)

  // 平台收藏数量
  const platformsCount = computed(() => getPlatforms.value.length)

  // 搜索收藏项
  const searchFavorites = (query: string): FavoriteEntry[] => {
    if (!query.trim()) {
      return getFavorites.value
    }

    const lowerQuery = query.toLowerCase().trim()
    
    return getFavorites.value.filter(item => {
      if (item.type === 'single') {
        const newsItem = item as FavoriteItem
        return (
          newsItem.title.toLowerCase().includes(lowerQuery) ||
          newsItem.content?.toLowerCase().includes(lowerQuery) ||
          newsItem.platformTitle.toLowerCase().includes(lowerQuery)
        )
      } else {
        const platformItem = item as FavoritePlatform
        return platformItem.platformTitle.toLowerCase().includes(lowerQuery)
      }
    })
  }

  // 按日期分组获取收藏
  const getFavoritesByDate = (): Record<string, FavoriteEntry[]> => {
    const grouped: Record<string, FavoriteEntry[]> = {}
    
    favorites.value.forEach(item => {
      const dateStr = getDateString(item.addedAt)
      if (!grouped[dateStr]) {
        grouped[dateStr] = []
      }
      grouped[dateStr].push(item)
    })
    
    // 对每个日期组内的项目按添加时间排序（最新的在前）
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => b.addedAt - a.addedAt)
    })
    
    return grouped
  }

  // 按平台筛选收藏
  const filterFavoritesByPlatform = (platform: string): FavoriteEntry[] => {
    return getFavorites.value.filter(item => 
      item.platform === platform
    )
  }

  // 批量删除收藏项
  const removeMultipleFavorites = async (itemIds: string[]): number => {
    let removedCount = 0
    
    // 从后往前删除，避免索引变化问题
    for (let i = favorites.value.length - 1; i >= 0; i--) {
      const item = favorites.value[i]
      if (item.type === 'single' && itemIds.includes((item as FavoriteItem).id)) {
        favorites.value.splice(i, 1)
        removedCount++
      } else if (item.type === 'platform' && itemIds.includes(item.platform)) {
        favorites.value.splice(i, 1)
        removedCount++
      }
    }
    
    if (removedCount > 0) {
      saveFavorites()
      
      // 如果已登录，同步到服务器
      if (authState.value.isLoggedIn) {
        try {
          await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.removeFavorite}`, {
            method: 'DELETE',
            body: JSON.stringify({ ids: itemIds })
          })
        } catch (err) {
          console.error('批量移除收藏失败:', err)
        }
      }
      
      success && success(`已移除 ${removedCount} 个收藏`)
    }
    
    return removedCount
  }

  // 获取收藏项的唯一ID
  const getFavoriteId = (item: FavoriteEntry): string => {
    if (item.type === 'single') {
      return (item as FavoriteItem).id
    } else {
      return `platform-${(item as FavoritePlatform).platform}`
    }
  }

  // 通过ID获取收藏项
  const getFavoriteById = (id: string): FavoriteEntry | undefined => {
    if (id.startsWith('platform-')) {
      const platformId = id.replace('platform-', '')
      return favorites.value.find(item => 
        item.type === 'platform' && (item as FavoritePlatform).platform === platformId
      )
    } else {
      return favorites.value.find(item => 
        item.type === 'single' && (item as FavoriteItem).id === id
      )
    }
  }

  // 通过ID删除收藏项
  const removeFavoriteById = async (id: string): boolean => {
    const index = favorites.value.findIndex(item => {
      if (item.type === 'single') {
        return (item as FavoriteItem).id === id
      } else {
        return item.type === 'platform' && (item as FavoritePlatform).platform === id.replace('platform-', '')
      }
    })
    
    if (index > -1) {
      // 更新本地状态
      favorites.value.splice(index, 1)
      saveFavorites()
      
      // 如果已登录，同步到服务器
      if (authState.value.isLoggedIn) {
        try {
          await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.removeFavorite}`, {
            method: 'DELETE',
            body: JSON.stringify({ id })
          })
        } catch (err) {
          console.error('从服务器移除收藏失败:', err)
        }
      }
      
      return true
    }
    return false
  }

  // 获取按平台分组的新闻收藏
  const getFavoritesByPlatform = (): Record<string, FavoriteItem[]> => {
    const grouped: Record<string, FavoriteItem[]> = {}
    
    getNewsItems.value.forEach(item => {
      if (!grouped[item.platformTitle]) {
        grouped[item.platformTitle] = []
      }
      grouped[item.platformTitle].push(item)
    })
    
    // 对每个平台组内的项目按添加时间排序
    Object.keys(grouped).forEach(platform => {
      grouped[platform].sort((a, b) => b.addedAt - a.addedAt)
    })
    
    return grouped
  }

  // 刷新收藏列表
  const refreshFavorites = async () => {
    if (authState.value.isLoggedIn) {
      await fetchFavoritesFromServer()
    }
  }

  return {
    // 基础数据和状态
    favorites,
    favoritesCount,
    isLoading,
    
    // 单条新闻收藏相关
    newsItems: getNewsItems,
    newsItemsCount,
    isFavorited,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    removeFavorite,
    
    // 平台收藏相关
    platforms: getPlatforms,
    platformsCount,
    isPlatformFavorited,
    togglePlatformFavorite,
    
    // 搜索和过滤
    searchFavorites,
    filterFavoritesByPlatform,
    getFavoritesByDate,
    getFavoritesByPlatform,
    
    // 操作方法
    clearFavorites,
    removeMultipleFavorites,
    getFavoriteId,
    getFavoriteById,
    removeFavoriteById,
    refreshFavorites
  }
}