/**
 * 推荐系统模拟数据服务
 * 提供个性化推荐的模拟数据，用于开发和测试
 */

import type { RecommendationConfig, RecommendationItem, UserInterest } from './recommendation'
import { generateMockNews } from './news.mock'

// 推荐数据接口
export interface RecommendationData {
  recommendedNews: RecommendationItem[]
  explanation?: string
  timestamp: number
}

// 生成模拟推荐数据
export const generateMockRecommendations = (userInterests?: UserInterest[]): RecommendationData => {
  // 生成15条模拟新闻作为推荐基础
  const recommendations: RecommendationItem[] = []
  
  for (let i = 0; i < 15; i++) {
    // 生成一条模拟新闻
    const news = generateMockNews()
    
    // 为每条新闻添加推荐相关字段
    recommendations.push({
      ...news,
      score: Math.random() * 0.5 + 0.5, // 推荐分数 0.5-1.0
      reason: generateRecommendationReason(news),
      interestTags: generateInterestTags(news),
      timestamp: Date.now()
    })
  }
  
  // 如果有用户兴趣，根据兴趣调整推荐分数
  if (userInterests && userInterests.length > 0) {
    recommendations.forEach(rec => {
      let interestScore = 0
      rec.interestTags.forEach(recTag => {
        const userInterest = userInterests.find(ui => ui.tag === recTag.tag)
        if (userInterest) {
          interestScore += userInterest.weight * recTag.weight
        }
      })
      // 结合原始分数和兴趣匹配分数
      rec.score = 0.6 * rec.score + 0.4 * interestScore
    })
  }
  
  // 按推荐分数排序
  recommendations.sort((a, b) => b.score - a.score)
  
  return {
    recommendedNews: recommendations,
    explanation: generateRecommendationExplanation(userInterests || [], {} as RecommendationConfig),
    timestamp: Date.now()
  }
}

// 生成推荐理由
const generateRecommendationReason = (news: any): string => {
  const reasons = [
    '基于您的阅读历史',
    '热门内容推荐',
    '您关注的主题',
    '猜您感兴趣',
    '编辑精选',
    '最近更新',
    '高互动内容',
    '与您看过的相似'
  ]
  
  // 根据新闻平台和内容类型生成更匹配的理由
  if (news.platform.includes('tech') || news.platform.includes('juejin') || news.platform.includes('csdn')) {
    return ['基于您对科技的兴趣', '技术圈热门讨论', '开发者关注热点'][Math.floor(Math.random() * 3)]
  } else if (news.platform.includes('finance') || news.platform.includes('gelonghui') || news.platform.includes('wallstreetcn')) {
    return ['财经资讯推荐', '市场热点追踪', '与您关注的股票相关'][Math.floor(Math.random() * 3)]
  } else if (news.platform.includes('social') || news.platform.includes('weibo')) {
    return ['社交热点', '高转发内容', '多人正在看'][Math.floor(Math.random() * 3)]
  } else if (news.platform.includes('sports') || news.platform.includes('hupu')) {
    return ['体育赛事动态', '您关注的球队', '热门比赛报道'][Math.floor(Math.random() * 3)]
  } else if (news.platform.includes('entertainment') || news.platform.includes('douban')) {
    return ['娱乐新鲜事', '高分影视推荐', '明星动态'][Math.floor(Math.random() * 3)]
  } else if (news.platform.includes('car')) {
    return ['汽车资讯精选', '新车测评', '汽车行业动态'][Math.floor(Math.random() * 3)]
  }
  
  return reasons[Math.floor(Math.random() * reasons.length)]
}

// 生成兴趣标签
const generateInterestTags = (news: any): Array<{ tag: string; weight: number }> => {
  // 基础标签池
  const allTags = [
    '科技', '人工智能', '区块链', '编程', '前端', '后端', '移动开发',
    '财经', '股票', '基金', '房地产', '创业', '投资', '数字货币',
    '体育', '足球', '篮球', '电竞', '健身',
    '娱乐', '电影', '音乐', '游戏', '明星',
    '汽车', '新能源', '自动驾驶', '电动车',
    '健康', '医疗', '营养',
    '教育', '职场', '学习',
    '生活', '旅行', '美食', '摄影',
    '社会', '时事', '环保'
  ]
  
  // 根据平台和标题内容选择相关标签
  const selectedTags = new Set<string>()
  
  // 基于平台的标签
  if (news.platform.includes('tech')) {
    selectedTags.add('科技')
    selectedTags.add(['人工智能', '编程', '前端', '后端'][Math.floor(Math.random() * 4)])
  }
  if (news.platform.includes('finance')) {
    selectedTags.add('财经')
    selectedTags.add(['股票', '投资', '创业'][Math.floor(Math.random() * 3)])
  }
  if (news.platform.includes('sports')) {
    selectedTags.add('体育')
    selectedTags.add(['足球', '篮球', '电竞'][Math.floor(Math.random() * 3)])
  }
  if (news.platform.includes('entertainment')) {
    selectedTags.add('娱乐')
    selectedTags.add(['电影', '音乐', '明星'][Math.floor(Math.random() * 3)])
  }
  if (news.platform.includes('car')) {
    selectedTags.add('汽车')
    selectedTags.add(['新能源', '自动驾驶', '电动车'][Math.floor(Math.random() * 3)])
  }
  
  // 基于标题内容的标签匹配
  const titleLower = news.title.toLowerCase()
  const contentLower = (news.content || '').toLowerCase()
  
  // 关键词与标签映射
  const keywordTagMap: Record<string, string> = {
    '人工智能': '人工智能',
    'ai': '人工智能',
    '区块链': '区块链',
    '比特币': '数字货币',
    '加密货币': '数字货币',
    '股票': '股票',
    '基金': '基金',
    '房价': '房地产',
    '创业': '创业',
    '投资': '投资',
    '足球': '足球',
    '篮球': '篮球',
    '电竞': '电竞',
    '游戏': '游戏',
    '电影': '电影',
    '音乐': '音乐',
    '明星': '明星',
    '汽车': '汽车',
    '新能源': '新能源',
    '自动驾驶': '自动驾驶',
    '电动车': '电动车',
    '健康': '健康',
    '医疗': '医疗',
    '教育': '教育',
    '职场': '职场',
    '旅行': '旅行',
    '美食': '美食',
    '摄影': '摄影',
    '社会': '社会',
    '时事': '时事',
    '环保': '环保'
  }
  
  // 匹配关键词
  Object.entries(keywordTagMap).forEach(([keyword, tag]) => {
    if (titleLower.includes(keyword) || contentLower.includes(keyword)) {
      selectedTags.add(tag)
    }
  })
  
  // 如果标签不足，随机添加一些
  if (selectedTags.size < 2) {
    while (selectedTags.size < 3) {
      const randomTag = allTags[Math.floor(Math.random() * allTags.length)]
      if (!selectedTags.has(randomTag)) {
        selectedTags.add(randomTag)
      }
    }
  }
  
  // 转换为带权重的标签数组
  return Array.from(selectedTags).map(tag => ({
    tag,
    weight: Math.random() * 0.5 + 0.5 // 权重 0.5-1.0
  })).sort((a, b) => b.weight - a.weight)
}

// 生成模拟用户兴趣
export const generateMockInterests = (): UserInterest[] => {
  const mockTags = [
    { tag: '科技', weight: 0.9, category: 'tech' },
    { tag: '人工智能', weight: 0.85, category: 'tech' },
    { tag: '财经', weight: 0.7, category: 'finance' },
    { tag: '体育', weight: 0.6, category: 'sports' },
    { tag: '娱乐', weight: 0.5, category: 'entertainment' },
    { tag: '汽车', weight: 0.4, category: 'car' },
    { tag: '健康', weight: 0.35, category: 'lifestyle' },
    { tag: '教育', weight: 0.3, category: 'education' },
    { tag: '旅行', weight: 0.25, category: 'lifestyle' },
    { tag: '美食', weight: 0.2, category: 'lifestyle' }
  ]
  
  // 随机选择3-6个标签作为用户兴趣
  const interestCount = Math.floor(Math.random() * 4) + 3
  const selectedTags = [...mockTags].sort(() => 0.5 - Math.random()).slice(0, interestCount)
  
  return selectedTags.map(tag => ({
    tag: tag.tag,
    weight: tag.weight,
    lastInteracted: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000) // 最近7天内
  }))
}

// 模拟获取推荐解释
const generateRecommendationExplanation = (
  userInterests: Array<{ tag: string; weight: number }>,
  config: RecommendationConfig
): string => {
  // 根据用户设置和兴趣生成解释文本
  if (!userInterests || userInterests.length === 0) {
    if (config.useHotTrends) {
      return '为您推荐当前热门内容，设置兴趣标签可以获得更个性化的推荐'
    }
    return '欢迎使用推荐功能，设置兴趣标签可以获得更个性化的内容'
  }
  
  // 获取用户最感兴趣的前两个标签
  const topInterests = [...userInterests]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 2)
  
  if (config.useUserInterests && config.useHotTrends) {
    return `基于您对 ${topInterests.map(i => i.tag).join('、')} 等的兴趣，为您推荐相关内容和热门资讯`
  } else if (config.useUserInterests) {
    return `根据您对 ${topInterests.map(i => i.tag).join('、')} 等的兴趣，为您精选相关内容`
  } else if (config.useHotTrends) {
    return '为您推荐当前热门内容'
  }
  
  return '为您推荐精选内容'
}

// 导出模拟函数
export {
  generateMockRecommendations,
  generateMockInterests,
  generateRecommendationExplanation
}
