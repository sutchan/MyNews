import {API_CONFIG, type ApiResponse} from './config'
import type {NewsItem} from './news'

/**
 * 用户兴趣标签接口
 */
export interface UserInterest {
  tag: string
  weight: number // 兴趣权重，范围0-1
  updatedAt: string // 最后更新时间
}

/**
 * 推荐配置接口
 */
export interface RecommendationConfig {
  maxResults: number // 最大推荐数量
  useUserInterests: boolean // 是否使用用户兴趣
  useHotTrends: boolean // 是否考虑热点趋势
  useDiversity: boolean // 是否保持多样性
  minFreshnessHours?: number // 最小新鲜度（小时）
}

/**
   * 推荐数据接口
   */
  // 分页信息接口
 export interface PaginationInfo {
   page: number
   pageSize: number
   total: number
   totalPages: number
 }
 
 // 推荐结果数据结构
  export interface RecommendationData {
    recommendedNews: NewsItem[]
    interests?: UserInterest[]
   explanation?: string // 推荐原因解释
   pagination?: PaginationInfo
  }

/**
 * 生成模拟推荐数据
 */
function generateMockRecommendations(userInterests: UserInterest[] = []): RecommendationData {
  // 模拟新闻数据
  const mockNewsItems: NewsItem[] = [
    {
      id: 'rec-1',
      title: '人工智能大模型在医疗领域取得突破性进展',
      content: '最新研究表明，AI大模型能够辅助医生诊断复杂疾病，准确率达到90%以上。',
      source: '科技日报',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
      url: 'https://example.com/news/1',
      image: 'https://picsum.photos/800/450?random=1',
      platform: 'tech',
      tags: ['人工智能', '医疗健康', '科技创新'],
      engagement: { readCount: 12453, commentCount: 532, shareCount: 892 }
    },
    {
      id: 'rec-2',
      title: '新能源汽车销量持续攀升，行业迎来发展黄金期',
      content: '国内新能源汽车市场保持高速增长，多家车企发布新产品，市场竞争加剧。',
      source: '汽车之家',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5小时前
      url: 'https://example.com/news/2',
      image: 'https://picsum.photos/800/450?random=2',
      platform: 'car',
      tags: ['新能源汽车', '销量数据', '行业动态'],
      engagement: { readCount: 23567, commentCount: 845, shareCount: 1243 }
    },
    {
      id: 'rec-3',
      title: '全球股市震荡，投资者如何应对市场波动',
      content: '金融专家建议投资者保持理性，多元化配置资产，避免盲目跟风。',
      source: '财经网',
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1小时前
      url: 'https://example.com/news/3',
      image: 'https://picsum.photos/800/450?random=3',
      platform: 'finance',
      tags: ['股市', '投资策略', '市场分析'],
      engagement: { readCount: 18765, commentCount: 623, shareCount: 789 }
    },
    {
      id: 'rec-4',
      title: '2024巴黎奥运会筹备工作进入最后阶段',
      content: '奥运会场馆建设已基本完成，各国运动员正积极备战，期待创造佳绩。',
      source: '体坛周报',
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3小时前
      url: 'https://example.com/news/4',
      image: 'https://picsum.photos/800/450?random=4',
      platform: 'sports',
      tags: ['奥运会', '体育赛事', '国际新闻'],
      engagement: { readCount: 34211, commentCount: 1234, shareCount: 2345 }
    },
    {
      id: 'rec-5',
      title: '短视频平台推出新功能，创作者收益模式再升级',
      content: '某知名短视频平台宣布优化创作者激励计划，预计将提升创作者收入30%以上。',
      source: '新浪科技',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4小时前
      url: 'https://example.com/news/5',
      image: 'https://picsum.photos/800/450?random=5',
      platform: 'social',
      tags: ['短视频', '内容创作', '互联网平台'],
      engagement: { readCount: 26789, commentCount: 987, shareCount: 1654 }
    },
    {
      id: 'rec-6',
      title: '国产科幻大片票房破纪录，影视产业迎来新春天',
      content: '由知名导演执导的科幻电影上映首周票房突破10亿元，刷新多项纪录。',
      source: '网易娱乐',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6小时前
      url: 'https://example.com/news/6',
      image: 'https://picsum.photos/800/450?random=6',
      platform: 'entertainment',
      tags: ['电影', '票房', '国产科幻'],
      engagement: { readCount: 45678, commentCount: 1567, shareCount: 3456 }
    }
  ]

  // 如果有用户兴趣，根据兴趣进行排序
  if (userInterests.length > 0) {
    mockNewsItems.sort((a, b) => {
      const scoreA = calculateNewsScore(a, userInterests)
      const scoreB = calculateNewsScore(b, userInterests)
      return scoreB - scoreA // 降序排列
    })
  } else {
    // 没有用户兴趣时，根据热度和新鲜度排序
    mockNewsItems.sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime()
      const timeB = new Date(b.publishedAt).getTime()
      const engagementA = a.engagement.readCount + a.engagement.commentCount * 10 + a.engagement.shareCount * 20
      const engagementB = b.engagement.readCount + b.engagement.commentCount * 10 + b.engagement.shareCount * 20
      // 70%权重给新鲜度，30%权重给热度
      const scoreA = 0.7 * (Date.now() - timeA) + 0.3 * engagementA
      const scoreB = 0.7 * (Date.now() - timeB) + 0.3 * engagementB
      return scoreA - scoreB // 升序排列（时间差越小越好）
    })
  }

  // 生成模拟兴趣数据（如果没有提供）
  const interests = userInterests.length > 0 ? userInterests : generateMockInterests()

  return {
    recommendedNews: mockNewsItems,
    interests,
    explanation: userInterests.length > 0 ? '根据您的阅读兴趣为您推荐相关内容' : '为您推荐热门新闻'
  }
}

/**
 * 根据用户兴趣计算新闻得分
 */
function calculateNewsScore(news: NewsItem, interests: UserInterest[]): number {
  let score = 0
  const now = Date.now()
  const publishTime = new Date(news.publishedAt).getTime()
  const hoursSincePublish = (now - publishTime) / (1000 * 60 * 60)
  
  // 计算标签匹配得分
  news.tags.forEach(tag => {
    const interest = interests.find(i => i.tag === tag)
    if (interest) {
      score += interest.weight
    }
  })
  
  // 考虑平台偏好
  const platformInterest = interests.find(i => i.tag === news.platform)
  if (platformInterest) {
    score += platformInterest.weight * 0.5
  }
  
  // 新鲜度因子（24小时内的新闻加分）
  const freshnessFactor = hoursSincePublish < 24 ? (24 - hoursSincePublish) / 24 : 0.1
  score *= freshnessFactor
  
  // 热度因子（根据阅读量、评论、分享加权）
  const engagementFactor = 1 + Math.log10(news.engagement.readCount / 1000)
  score *= engagementFactor
  
  return score
}

/**
 * 生成模拟用户兴趣
 */
function generateMockInterests(): UserInterest[] {
  const allTags = [
    '人工智能', '科技创新', '数字经济', '新能源', '体育赛事',
    '影视娱乐', '财经投资', '汽车产业', '社交媒体', '健康生活'
  ]
  
  // 随机选择3-5个兴趣标签
  const interestCount = Math.floor(Math.random() * 3) + 3
  const shuffledTags = [...allTags].sort(() => 0.5 - Math.random())
  const selectedTags = shuffledTags.slice(0, interestCount)
  
  return selectedTags.map(tag => ({
    tag,
    weight: (Math.random() * 0.6) + 0.4, // 0.4-1.0的随机权重
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // 最近7天内的随机时间
  }))
}

/**
 * 获取个性化新闻推荐
 */
export async function fetchRecommendations(
  userId?: string,
  config: RecommendationConfig & {
    page?: number
    pageSize?: number
  } = {
    maxResults: 10,
    useUserInterests: true,
    useHotTrends: true,
    useDiversity: true,
    page: 1,
    pageSize: 10
  }
): Promise<RecommendationData & { pagination?: {
  page: number
  pageSize: number
  total: number
  totalPages: number
}}> {
  // 确保分页参数有默认值
  const page = config.page || 1
  const pageSize = config.pageSize || 10
  
  // 开发环境或测试环境直接使用模拟数据
  if (import.meta.env.DEV || !import.meta.env.PROD) {
    console.log('使用推荐系统模拟数据')
    // 获取用户兴趣（如果有）
    let userInterests: UserInterest[] = []
    if (userId && config.useUserInterests) {
      try {
        userInterests = await fetchUserInterests(userId)
      } catch (error) {
        console.warn('获取用户兴趣失败，使用默认兴趣:', error)
      }
    }
    
    // 返回模拟推荐数据
    const mockData = generateMockRecommendations(userInterests)
    const allRecommendations = mockData.recommendedNews
    
    // 应用分页逻辑
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedRecommendations = allRecommendations.slice(startIndex, endIndex)
    
    return {
      ...mockData,
      recommendedNews: paginatedRecommendations,
      pagination: {
        page,
        pageSize,
        total: allRecommendations.length,
        totalPages: Math.ceil(allRecommendations.length / pageSize)
      }
    }
  }

  // 优先尝试API调用
  if (import.meta.env.PROD && API_CONFIG.baseURL) {
    const url = new URL(`${API_CONFIG.baseURL}/news/recommendations`)
    
    // 添加查询参数
    if (userId) url.searchParams.append('userId', userId)
    url.searchParams.append('maxResults', config.maxResults.toString())
    url.searchParams.append('useUserInterests', config.useUserInterests.toString())
    url.searchParams.append('useHotTrends', config.useHotTrends.toString())
    url.searchParams.append('useDiversity', config.useDiversity.toString())
    url.searchParams.append('page', page.toString())
    url.searchParams.append('pageSize', pageSize.toString())
    if (config.minFreshnessHours) {
      url.searchParams.append('minFreshnessHours', config.minFreshnessHours.toString())
    }

    try {
      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<RecommendationData & { pagination?: {
        page: number
        pageSize: number
        total: number
        totalPages: number
      }}> = await response.json()

      if (result.code === 200) {
        return result.data
      } else {
        throw new Error(result.msg || '获取推荐失败')
      }
    } catch (error) {
      // 如果API调用失败，返回模拟数据
      console.warn('推荐API调用失败，使用模拟数据:', error)
    }
  }
  
  // 获取用户兴趣（如果有）
  let userInterests: UserInterest[] = []
  if (userId && config.useUserInterests) {
    try {
      userInterests = await fetchUserInterests(userId)
    } catch (error) {
      console.warn('获取用户兴趣失败，使用默认兴趣:', error)
    }
  }
  
  // 返回模拟推荐数据
  const mockData = generateMockRecommendations(userInterests)
  const allRecommendations = mockData.recommendedNews
  
  // 应用分页逻辑
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRecommendations = allRecommendations.slice(startIndex, endIndex)
  
  return {
    ...mockData,
    recommendedNews: paginatedRecommendations,
    pagination: {
      page,
      pageSize,
      total: allRecommendations.length,
      totalPages: Math.ceil(allRecommendations.length / pageSize)
    }
  }
}

/**
 * 获取用户兴趣标签
 */
export async function fetchUserInterests(userId: string): Promise<UserInterest[]> {
  // 开发环境或测试环境使用本地存储或模拟数据
  if (import.meta.env.DEV || !import.meta.env.PROD) {
    console.log('获取用户兴趣（模拟环境）:', userId)
    
    // 尝试从本地存储获取用户兴趣
    try {
      const storedInterests = localStorage.getItem(`user_interests_${userId}`)
      if (storedInterests) {
        return JSON.parse(storedInterests)
      }
    } catch (error) {
      console.warn('读取本地用户兴趣失败:', error)
    }
    
    // 返回模拟兴趣数据
    return generateMockInterests()
  }

  // 优先尝试API调用
  if (import.meta.env.PROD && API_CONFIG.baseURL) {
    const url = `${API_CONFIG.baseURL}/user/interests?userId=${encodeURIComponent(userId)}`

    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<UserInterest[]> = await response.json()

      if (result.code === 200) {
        return result.data
      } else {
        throw new Error(result.msg || '获取用户兴趣失败')
      }
    } catch (error) {
      // 如果API调用失败，使用本地存储数据
      console.warn('用户兴趣API调用失败，使用本地数据:', error)
    }
  }
  
  // 尝试从本地存储获取用户兴趣
  try {
    const storedInterests = localStorage.getItem(`user_interests_${userId}`)
    if (storedInterests) {
      return JSON.parse(storedInterests)
    }
  } catch (error) {
    console.warn('读取本地用户兴趣失败:', error)
  }
  
  // 返回模拟兴趣数据
  return generateMockInterests()
}

/**
 * 记录推荐交互事件
 */
export async function recordRecommendationInteraction(
  newsItem: NewsItem,
  interactionType: 'view' | 'like' | 'dislike' | 'share' | 'comment'
): Promise<void> {
  // 开发环境下记录操作
  if (import.meta.env.DEV || !import.meta.env.PROD) {
    console.log('记录推荐交互:', {
      newsItemId: newsItem.id,
      interactionType
    })
    return
  }

  // 优先尝试API调用
  if (import.meta.env.PROD && API_CONFIG.baseURL) {
    try {
      const url = `${API_CONFIG.baseURL}/news/interactions`
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newsId: newsItem.id,
          type: interactionType,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.warn('记录推荐交互失败:', error)
    }
  }
}

/**
 * 获取推荐解释
 */
export async function getRecommendationExplanation(
  userId?: string,
  newsId?: string
): Promise<string> {
  // 开发环境下返回默认解释
  if (import.meta.env.DEV || !import.meta.env.PROD) {
    return '为您推荐精选内容'
  }

  // 优先尝试API调用
  if (import.meta.env.PROD && API_CONFIG.baseURL) {
    try {
      const url = new URL(`${API_CONFIG.baseURL}/news/recommendation-explanation`)
      if (userId) url.searchParams.append('userId', userId)
      if (newsId) url.searchParams.append('newsId', newsId)
      
      const response = await fetch(url.toString())
      const result: ApiResponse<{ explanation: string }> = await response.json()
      
      if (result.code === 200) {
        return result.data.explanation
      }
    } catch (error) {
      console.warn('获取推荐解释失败:', error)
    }
  }
  
  return '为您推荐精选内容'
}

/**
 * 更新用户兴趣标签（基于用户行为）
 */
export async function updateUserInterests(
  userId: string,
  newsItem: NewsItem,
  interactionType: 'view' | 'like' | 'dislike' | 'share' | 'comment'
): Promise<UserInterest[]> {
  // 开发环境下记录更新操作
  if (import.meta.env.DEV || !import.meta.env.PROD) {
    console.log('更新用户兴趣（模拟环境）:', {
      userId,
      newsItemId: newsItem.id,
      interactionType
    })
  }

  // 确定交互权重
  const interactionWeights = {
    view: 0.1,
    like: 0.5,
    dislike: -0.3,
    share: 0.8,
    comment: 0.6
  }
  
  const weightMultiplier = interactionWeights[interactionType]
  
  // 获取当前兴趣
  let interests = await fetchUserInterests(userId)
  const interestMap = new Map(interests.map(i => [i.tag, i]))
  const now = new Date().toISOString()
  
  // 更新标签权重
  const allTags = [...newsItem.tags, newsItem.platform] // 包含新闻标签和平台
  
  allTags.forEach(tag => {
    const existingInterest = interestMap.get(tag)
    
    if (existingInterest) {
      // 更新现有兴趣
      let newWeight = existingInterest.weight + weightMultiplier * 0.1
      newWeight = Math.max(0, Math.min(1, newWeight)) // 限制在0-1范围内
      
      existingInterest.weight = newWeight
      existingInterest.updatedAt = now
    } else if (weightMultiplier > 0) {
      // 添加新兴趣（仅当交互为正反馈时）
      interestMap.set(tag, {
        tag,
        weight: Math.min(1, Math.abs(weightMultiplier) * 0.3), // 初始权重
        updatedAt: now
      })
    }
  })
  
  // 转换回数组并排序（按权重降序）
  interests = Array.from(interestMap.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20) // 保留前20个兴趣
  
  // 保存到本地存储
  try {
    localStorage.setItem(`user_interests_${userId}`, JSON.stringify(interests))
  } catch (error) {
    console.warn('保存用户兴趣失败:', error)
  }
  
  // 尝试同步到服务器
  if (import.meta.env.PROD && API_CONFIG.baseURL) {
    try {
      const url = `${API_CONFIG.baseURL}/user/interests`
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          interests,
          interaction: {
            newsId: newsItem.id,
            type: interactionType,
            timestamp: now
          }
        })
      })
    } catch (error) {
      console.warn('同步用户兴趣到服务器失败:', error)
    }
  }
  
  // 为了兼容测试，添加lastInteracted字段
  return interests.map(interest => ({
    ...interest,
    lastInteracted: new Date(interest.updatedAt).getTime()
  }))
}
