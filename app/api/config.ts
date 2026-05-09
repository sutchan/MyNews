// app/api/config.ts v2.0.0
// API 配置
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:10010',
  timeout: 10000,
}

// API 路径
export const API_ENDPOINTS = {
  // 平台相关
  platforms: '/platforms',
  
  // 新闻相关
  news: '/news',
  newsDetail: '/news/detail',
  newsSearch: '/news/search',
  newsInteractions: '/news/interactions',
  
  // 推荐系统相关
  recommendations: '/news/recommendations',
  recommendationExplanation: '/news/recommendation-explanation',
  
  // AI 相关
  aiSummary: '/news/ai',
  
  // 用户相关
  userInfo: '/user/info',
  userLogin: '/user/login',
  userRegister: '/user/register',
  userLogout: '/user/logout',
  userInterests: '/user/interests',
  userFavorites: '/user/favorites',
  userHistory: '/user/history',
  
  // 验证码相关
  getVerificationCode: '/user/verify-code',
  
  // 第三方登录
  githubLogin: '/user/login/github',
  wechatLogin: '/user/login/wechat',
  
  // 收藏相关
  addFavorite: '/user/favorites/add',
  removeFavorite: '/user/favorites/remove',
  getFavorites: '/user/favorites',
  
  // 历史记录相关
  addHistory: '/user/history/add',
  removeHistory: '/user/history/remove',
  clearHistory: '/user/history/clear',
  getHistory: '/user/history',
} as const

export type ApiResponse<T> = {
  code: number
  msg: string
  data: T
}
