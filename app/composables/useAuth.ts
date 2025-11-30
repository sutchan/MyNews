// 用户认证相关的组合式函数

import { ref, computed } from 'vue'
import { API_CONFIG, API_ENDPOINTS, type ApiResponse } from '@/api/config'

// 用户信息类型
export interface UserInfo {
  id: string
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
  loginType: 'phone' | 'wechat' | 'github' | 'email'
  createdAt: number
  updatedAt: number
  lastLoginAt?: number
}

// 认证状态类型
interface AuthState {
  isLoggedIn: boolean
  userInfo: UserInfo | null
  token: string | null
  loading: boolean
  error: string | null
}

// 本地存储的键名
const AUTH_STORAGE_KEY = 'news-auth'

// 认证状态
const authState = ref<AuthState>({
  isLoggedIn: false,
  userInfo: null,
  token: null,
  loading: false,
  error: null
})

// 从本地存储加载认证状态 - SSR兼容版本
const loadAuthState = () => {
  // 只在客户端执行
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        authState.value = {
          isLoggedIn: parsed.isLoggedIn || false,
          userInfo: parsed.userInfo || null,
          token: parsed.token || null,
          loading: false,
          error: null
        }
      }
    } catch (error) {
      console.error('加载认证状态失败:', error)
      authState.value = {
        isLoggedIn: false,
        userInfo: null,
        token: null,
        loading: false,
        error: null
      }
    }
  }
}

// 保存认证状态到本地存储 - SSR兼容版本
const saveAuthState = () => {
  // 只在客户端执行
  if (import.meta.client) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState.value))
    } catch (error) {
      console.error('保存认证状态失败:', error)
    }
  }
}

// 通用请求函数
const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  }
  
  // 如果有token，添加到请求头
  if (authState.value.token) {
    headers['Authorization'] = `Bearer ${authState.value.token}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'omit' // 避免发送不必要的cookie，提高安全性
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

// 手机号登录
const loginWithPhone = async (phone: string, code: string): Promise<boolean> => {
  authState.value.loading = true
  authState.value.error = null
  
  try {
    const data = await request<{
      token: string
      userInfo: UserInfo
    }>(`${API_CONFIG.baseURL}${API_ENDPOINTS.userLogin}`, {
      method: 'POST',
      body: JSON.stringify({
        phone,
        code,
        loginType: 'phone'
      })
    })
    
    authState.value = {
      isLoggedIn: true,
      userInfo: data.userInfo,
      token: data.token,
      loading: false,
      error: null
    }
    
    saveAuthState()
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '手机号登录失败'
    authState.value.error = errorMessage
    authState.value.loading = false
    console.error('手机号登录失败:', error)
    return false
  }
}

// 邮箱登录
const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
  authState.value.loading = true
  authState.value.error = null
  
  try {
    const data = await request<{
      token: string
      userInfo: UserInfo
    }>(`${API_CONFIG.baseURL}${API_ENDPOINTS.userLogin}`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        loginType: 'email'
      })
    })
    
    authState.value = {
      isLoggedIn: true,
      userInfo: data.userInfo,
      token: data.token,
      loading: false,
      error: null
    }
    
    saveAuthState()
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '邮箱登录失败'
    authState.value.error = errorMessage
    authState.value.loading = false
    console.error('邮箱登录失败:', error)
    return false
  }
}

// 微信登录
const loginWithWechat = async (): Promise<boolean> => {
  authState.value.loading = true
  authState.value.error = null
  
  try {
    // 跳转到微信授权页面
    window.location.href = `${API_CONFIG.baseURL}${API_ENDPOINTS.wechatLogin}`
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '微信登录失败'
    authState.value.error = errorMessage
    authState.value.loading = false
    console.error('微信登录失败:', error)
    return false
  }
}

// GitHub登录
const loginWithGitHub = async (): Promise<boolean> => {
  authState.value.loading = true
  authState.value.error = null
  
  try {
    // 跳转到GitHub授权页面
    window.location.href = `${API_CONFIG.baseURL}${API_ENDPOINTS.githubLogin}`
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'GitHub登录失败'
    authState.value.error = errorMessage
    authState.value.loading = false
    console.error('GitHub登录失败:', error)
    return false
  }
}

// 注册
const register = async (email: string, password: string, nickname?: string): Promise<boolean> => {
  authState.value.loading = true
  authState.value.error = null
  
  try {
    const data = await request<{
      token: string
      userInfo: UserInfo
    }>(`${API_CONFIG.baseURL}${API_ENDPOINTS.userRegister}`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        nickname,
        loginType: 'email'
      })
    })
    
    authState.value = {
      isLoggedIn: true,
      userInfo: data.userInfo,
      token: data.token,
      loading: false,
      error: null
    }
    
    saveAuthState()
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '注册失败'
    authState.value.error = errorMessage
    authState.value.loading = false
    console.error('注册失败:', error)
    return false
  }
}

// 登出
const logout = async (): Promise<boolean> => {
  authState.value.loading = true
  
  try {
    // 调用后端登出接口
    await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.userLogout}`, {
      method: 'POST'
    })
    
    // 清除本地状态
    authState.value = {
      isLoggedIn: false,
      userInfo: null,
      token: null,
      loading: false,
      error: null
    }
    
    // 清除本地存储
    if (import.meta.client) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } catch (error) {
        console.error('清除认证状态失败:', error)
      }
    }
    
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '登出失败'
    authState.value.error = errorMessage
    authState.value.loading = false
    console.error('登出失败:', error)
    
    // 即使后端失败，也要清除本地状态
    authState.value = {
      isLoggedIn: false,
      userInfo: null,
      token: null,
      loading: false,
      error: null
    }
    
    if (import.meta.client) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } catch (error) {
        console.error('清除认证状态失败:', error)
      }
    }
    
    return false
  }
}

// 获取验证码
const getVerificationCode = async (phone: string): Promise<boolean> => {
  try {
    await request(`${API_CONFIG.baseURL}${API_ENDPOINTS.getVerificationCode}`, {
      method: 'POST',
      body: JSON.stringify({
        phone,
        type: 'login'
      })
    })
    
    console.log(`验证码已发送到 ${phone}`)
    return true
  } catch (error) {
    console.error('获取验证码失败:', error)
    return false
  }
}

// 获取用户信息
const getUserInfo = async (): Promise<UserInfo | null> => {
  if (!authState.value.token) {
    return null
  }
  
  try {
    const userInfo = await request<UserInfo>(`${API_CONFIG.baseURL}${API_ENDPOINTS.userInfo}`)
    authState.value.userInfo = userInfo
    saveAuthState()
    return userInfo
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 更新用户信息
const updateUserInfo = async (userInfo: Partial<UserInfo>): Promise<boolean> => {
  if (!authState.value.token) {
    return false
  }
  
  try {
    const updatedUserInfo = await request<UserInfo>(`${API_CONFIG.baseURL}${API_ENDPOINTS.userInfo}`, {
      method: 'PUT',
      body: JSON.stringify(userInfo)
    })
    
    authState.value.userInfo = updatedUserInfo
    saveAuthState()
    return true
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return false
  }
}

// 检查认证状态
const checkAuth = async (): Promise<boolean> => {
  if (!authState.value.token) {
    return false
  }
  
  try {
    await getUserInfo()
    return true
  } catch (error) {
    // 认证失败，清除状态
    authState.value = {
      isLoggedIn: false,
      userInfo: null,
      token: null,
      loading: false,
      error: null
    }
    
    if (import.meta.client) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } catch (error) {
        console.error('清除认证状态失败:', error)
      }
    }
    
    return false
  }
}

// 初始化认证状态
if (import.meta.client) {
  loadAuthState()
  // 检查认证状态是否有效
  if (authState.value.token && authState.value.isLoggedIn) {
    checkAuth()
  }
}

// 组合式函数，提供所有认证功能
export const useAuth = () => {
  return {
    authState,
    loginWithPhone,
    loginWithEmail,
    loginWithWechat,
    loginWithGitHub,
    register,
    logout,
    getVerificationCode,
    getUserInfo,
    updateUserInfo,
    checkAuth,
    loadAuthState
  }
}

// 也保持单独导出，方便直接使用
export { 
  authState,
  loginWithPhone,
  loginWithEmail,
  loginWithWechat,
  loginWithGitHub,
  register,
  logout,
  getVerificationCode,
  getUserInfo,
  updateUserInfo,
  checkAuth,
  loadAuthState 
}