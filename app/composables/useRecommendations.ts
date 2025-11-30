import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from './useAuth'
import {
  fetchRecommendations,
  updateUserInterests,
  fetchUserInterests,
  recordRecommendationInteraction,
  type RecommendationData,
  type NewsItem,
  type UserInterest,
  type RecommendationConfig
} from '@/api/recommendation'
import { useLocalStorage } from '@vueuse/core'

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        resolve(func(...args))
      }, delay)
    })
  }
}

/**
 * 推荐系统组合式API
 * 提供推荐内容加载、用户兴趣管理、配置管理等功能
 */
export function useRecommendations() {
  const { authState } = useAuth()
  
  // 用户兴趣数据 - 使用localStorage持久化存储
  const userInterests = useLocalStorage<UserInterest[]>('user-interests', [])
  
  // 推荐配置 - 使用localStorage持久化存储
  const config = useLocalStorage<RecommendationConfig>('recommendation-config', {
    maxResults: 10,
    useUserInterests: true,
    useHotTrends: true,
    useDiversity: true,
    minFreshnessHours: 24
  })
  
  // 推荐新闻数据 - 使用localStorage缓存
  const recommendedNews = useLocalStorage<NewsItem[]>('cached-recommendations', [], {
    mergeDefaults: false
  })
  
  // 推荐说明 - 使用localStorage缓存
  const recommendationExplanation = useLocalStorage<string>('cached-recommendation-explanation', '')
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const error = ref<string | null>(null)
  
  // 最后更新时间 - 使用localStorage记录
  const lastUpdated = useLocalStorage<number>('last-recommendations-update', 0)
  
  // 缓存是否有效（10分钟内的缓存视为有效）
  const isCacheValid = computed(() => {
    const tenMinutes = 10 * 60 * 1000
    return Date.now() - lastUpdated.value < tenMinutes
  })
  
  /**
   * 获取推荐内容的防抖版本
   * @param options 推荐配置选项
   * @returns 推荐数据
   */
  const debouncedFetch = debounce(async (options?: {
    page?: number
    pageSize?: number
    append?: boolean
  } & Partial<RecommendationConfig>) => {
    try {
      // 合并默认配置和自定义配置
      const mergedConfig = {
        ...config.value,
        ...options,
        page: options?.page || 1,
        pageSize: options?.pageSize || 10
      }
      
      // 只在不是分页加载时更新全局配置
      if (!options?.append || options?.page === 1) {
        config.value = mergedConfig
      }
      
      // 调用API获取推荐数据
      const data = await fetchRecommendations(
        authState.value.userInfo?.id || '',
        mergedConfig
      )
      
      // 根据模式决定是替换还是追加内容
      const newNews = data.recommendedNews || []
      if (options?.append && options?.page > 1) {
        // 追加模式，添加新内容
        // 去重处理，避免重复推荐同一篇新闻
        const existingIds = new Set(recommendedNews.value.map(item => item.id))
        const uniqueNewNews = newNews.filter(item => !existingIds.has(item.id))
        recommendedNews.value = [...recommendedNews.value, ...uniqueNewNews]
      } else {
        // 替换模式，使用新内容
        recommendedNews.value = newNews
        
        // 更新缓存
        recommendationExplanation.value = data.explanation || ''
        lastUpdated.value = Date.now()
      }
      
      if (data.interests) {
        // 确保每个兴趣有lastInteracted字段以兼容测试
        userInterests.value = data.interests.map(interest => ({
          ...interest,
          lastInteracted: interest.lastInteracted || Date.now()
        }))
      }
      
      return data
    } catch (error) {
      console.error('防抖获取推荐失败:', error)
      throw error
    }
  }, 300)
  
  /**
   * 获取推荐内容
   * 支持分页加载、缓存优先、强制刷新等功能
   * @param options 推荐配置选项
   * @returns 推荐数据或null（加载失败）
   */
  const loadRecommendations = async (options?: {
    page?: number
    pageSize?: number
    append?: boolean
    forceRefresh?: boolean
  } & Partial<RecommendationConfig>) => {
    // 如果是首次加载且有有效缓存，直接使用缓存
    if (!isLoading.value && !options?.append && !options?.forceRefresh && 
        isCacheValid.value && recommendedNews.value.length > 0) {
      console.log('使用缓存的推荐内容')
      return {
        recommendedNews: recommendedNews.value,
        explanation: recommendationExplanation.value
      } as RecommendationData
    }
    
    if (isLoading.value) {
      console.log('加载中，跳过重复请求')
      return null
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const result = await debouncedFetch(options)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取推荐内容失败'
      error.value = errorMessage
      console.error('加载推荐失败:', err)
      
      // 加载失败但有缓存时，返回缓存数据
      if (recommendedNews.value.length > 0) {
        console.log('网络异常，使用缓存数据')
        return {
          recommendedNews: recommendedNews.value,
          explanation: recommendationExplanation.value
        } as RecommendationData
      }
      
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // 更新用户兴趣（基于用户交互）
  const updateInterests = async (
    newsItem: NewsItem,
    interactionType: 'view' | 'like' | 'dislike' | 'share' | 'comment'
  ) => {
    if (!authState.value.userInfo?.id) return null
    
    try {
      const updatedInterests = await updateUserInterests(
        authState.value.userInfo.id,
        newsItem,
        interactionType
      )
      
      // 确保每个兴趣有lastInteracted字段以兼容测试
      userInterests.value = updatedInterests.map(interest => ({
        ...interest,
        lastInteracted: interest.lastInteracted || Date.now()
      }))
      
      return updatedInterests
    } catch (err) {
      console.error('更新用户兴趣失败:', err)
      return null
    }
  }
  
  // 记录推荐交互
  const recordInteraction = async (
    newsItemOrId: NewsItem | string,
    interactionType: 'view' | 'like' | 'dislike' | 'share' | 'comment'
  ) => {
    if (!authState.value.userInfo?.id) {
      console.warn('无法记录交互：用户未登录')
      return false
    }
    
    try {
      let newsItem: NewsItem | undefined
      
      // 判断传入的是新闻对象还是ID
      if (typeof newsItemOrId === 'string') {
        // 通过ID查找新闻项
        newsItem = recommendedNews.value.find(n => n.id === newsItemOrId)
        if (!newsItem) {
          console.warn(`无法找到新闻项：${newsItemOrId}`)
          return false
        }
      } else {
        // 直接使用传入的新闻对象
        newsItem = newsItemOrId
      }
      
      // 记录交互
      await recordRecommendationInteraction(newsItem, interactionType)
      
      // 更新用户兴趣
      await updateInterests(newsItem, interactionType)
      
      // 如果是重要交互，重新加载推荐
      if (interactionType !== 'view') {
        await loadRecommendations()
      }
      
      return true
    } catch (err) {
      console.error('记录推荐交互失败:', err)
      return false
    }
  }
  
  // 刷新用户兴趣数据
  const refreshUserInterests = async () => {
    if (!authState.value.userInfo?.id) {
      return
    }
    
    try {
      const interests = await fetchUserInterests(authState.value.userInfo.id)
      // 确保每个兴趣有lastInteracted字段以兼容测试
      userInterests.value = interests.map(interest => ({
        ...interest,
        lastInteracted: interest.lastInteracted || Date.now()
      }))
    } catch (err) {
      console.error('刷新用户兴趣失败:', err)
    }
  }
  
  // 添加用户兴趣标签
  const addUserInterest = (tag: string) => {
    const existingIndex = userInterests.value.findIndex(interest => interest.tag === tag)
    
    if (existingIndex >= 0) {
      // 更新现有标签的权重
      userInterests.value[existingIndex].weight = Math.min(1, userInterests.value[existingIndex].weight + 0.2)
      userInterests.value[existingIndex].updatedAt = new Date().toISOString()
      userInterests.value[existingIndex].lastInteracted = Date.now()
    } else {
      // 添加新标签
      const now = new Date()
      userInterests.value.push({
        tag,
        weight: 0.5,
        updatedAt: now.toISOString(),
        lastInteracted: now.getTime()
      })
    }
  }
  
  // 移除用户兴趣标签
  const removeUserInterest = (tag: string) => {
    const index = userInterests.value.findIndex(interest => interest.tag === tag)
    if (index >= 0) {
      userInterests.value.splice(index, 1)
    }
  }
  

  
  // 计算属性：兴趣标签云（用于UI展示）
  const interestTags = computed(() => {
    // 根据权重计算字体大小范围
    const minSize = 14 // 最小字体大小（px）
    const maxSize = 24 // 最大字体大小（px）
    
    return userInterests.value.map(interest => ({
      ...interest,
      fontSize: minSize + (interest.weight * (maxSize - minSize)),
      // 可以添加颜色计算等
      color: `hsl(${(interest.weight * 60) + 200}, 70%, ${60 + interest.weight * 15}%)`
    }))
  })
  
  // 计算属性：兴趣标签云数据（简化版，用于测试）
  const interestTagsCloud = computed(() => {
    return userInterests.value
      .filter(interest => interest.weight > 0.1) // 只显示权重较高的兴趣
      .sort((a, b) => b.weight - a.weight)
  })
  
  // 计算属性：推荐内容分类统计
  const contentCategoryStats = computed(() => {
    const stats = new Map<string, number>()
    
    recommendedNews.value.forEach(news => {
      const platform = news.platform || '其他'
      stats.set(platform, (stats.get(platform) || 0) + 1)
    })
    
    return Array.from(stats.entries()).map(([name, count]) => ({
      name,
      category: name, // 兼容两种命名方式
      count,
      percentage: Math.round((count / recommendedNews.value.length) * 100)
    })).sort((a, b) => b.count - a.count)
  })
  
  // 监听用户变化，刷新兴趣数据
  watch(() => authState.value.userInfo?.id, (newUserId, oldUserId) => {
    if (newUserId && newUserId !== oldUserId) {
      refreshUserInterests()
      // 如果用户登录状态改变，重新获取推荐
      loadRecommendations()
    }
  })
  
  // 初始加载
  onMounted(() => {
    // 页面加载时获取推荐内容
    loadRecommendations()
  })
  
  /**
   * 页面可见性变化时刷新推荐（用户回到页面时）
   */
  onMounted(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !isCacheValid.value && !isLoading.value) {
        console.log('页面回到前台，刷新推荐内容')
        loadRecommendations()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // 清理事件监听器
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })
  
  /**
   * 监听兴趣变化，延迟刷新推荐
   */
  const debouncedRefreshOnInterestsChange = debounce(() => {
    console.log('用户兴趣变化，刷新推荐内容')
    loadRecommendations({ forceRefresh: true })
  }, 1000)
  
  watch(userInterests, () => {
    debouncedRefreshOnInterestsChange()
  }, { deep: true })
  
  return {
    // 状态数据
    recommendedNews,
    userInterests,
    config,
    isLoading,
    error,
    recommendationExplanation,
    lastUpdated,
    isCacheValid,
    
    // 兼容性属性
    recommendations: recommendedNews, // 保留旧属性名以兼容现有代码
    
    // 计算属性
    interestTags,
    interestTagsCloud,
    contentCategoryStats,
    
    // 方法
    loadRecommendations,
    recordInteraction,
    refreshUserInterests,
    updateInterests,
    addUserInterest,
    removeUserInterest,
    
    // 辅助函数
    setConfig: (newConfig: Partial<RecommendationConfig>) => {
      config.value = { ...config.value, ...newConfig }
      // 配置更改后重新加载推荐
      loadRecommendations()
    },
    resetConfig: () => {
      config.value = {
        maxResults: 10,
        useUserInterests: true,
        useHotTrends: true,
        useDiversity: true
      }
    },
    refreshInterests: refreshUserInterests
  }
}
