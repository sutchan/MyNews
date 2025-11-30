<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  ArrowLeft, 
  Eye, 
  MessageCircle, 
  ThumbsUp, 
  Calendar, 
  Clock, 
  Globe, 
  ChevronRight 
} from 'lucide-vue-next'
import { API_CONFIG, API_ENDPOINTS, type ApiResponse } from '@/api/config'
import { type NewsItem } from '@/api/news'
import { useAuth } from '@/composables/useAuth'
import { useFavorites } from '@/composables/useFavorites'
import { useHistory } from '@/composables/useHistory'
import { useRecommendations } from '@/composables/useRecommendations'
import { getPlatformIcon } from '@/config/platforms'

// 路由和导航
const route = useRoute()
const router = useRouter()
const newsId = route.params.id as string
const platform = route.query.platform as string || ''

// 状态管理
const { authState } = useAuth()
const { addFavorite, removeFavorite, isFavorite } = useFavorites()
const { addToHistory } = useHistory()
const { recordInteraction } = useRecommendations()

// 新闻详情数据
const newsDetail = ref<NewsItem | null>(null)
const relatedNews = ref<NewsItem[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isFavoriteNews = ref(false)

// 计算属性
const isLoggedIn = computed(() => authState.value.isLoggedIn)

// 获取新闻详情
const fetchNewsDetail = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.newsDetail}?id=${newsId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<NewsItem> = await response.json()
    if (result.code === 200) {
      newsDetail.value = result.data
      
      // 检查是否已收藏
      if (isLoggedIn.value) {
        isFavoriteNews.value = await isFavorite(newsId)
      }
      
      // 添加到历史记录
      if (isLoggedIn.value) {
        await addToHistory(result.data)
      }
      
      // 记录浏览交互
      await recordInteraction(result.data, 'view')
      
      // 获取相关推荐
      fetchRelatedNews()
    } else {
      throw new Error(result.msg || '获取新闻详情失败')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取新闻详情失败'
    console.error('获取新闻详情失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 获取相关推荐
const fetchRelatedNews = async () => {
  if (!newsDetail.value) return
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.recommendations}?relatedTo=${newsId}&maxResults=5`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<{ recommendedNews: NewsItem[] }> = await response.json()
    if (result.code === 200) {
      relatedNews.value = result.recommendedNews
    }
  } catch (err) {
    console.error('获取相关推荐失败:', err)
  }
}

// 处理收藏/取消收藏
const toggleFavorite = async () => {
  if (!isLoggedIn.value) {
    // 跳转到登录页面
    router.push('/login')
    return
  }
  
  if (!newsDetail.value) return
  
  try {
    if (isFavoriteNews.value) {
      await removeFavorite(newsId)
      isFavoriteNews.value = false
    } else {
      await addFavorite(newsDetail.value)
      isFavoriteNews.value = true
    }
  } catch (err) {
    console.error('处理收藏失败:', err)
  }
}

// 分享新闻
const shareNews = () => {
  if (!newsDetail.value) return
  
  const shareText = `${newsDetail.value.title} - 今日时事`
  const shareUrl = window.location.href
  
  // 记录分享交互
  recordInteraction(newsDetail.value, 'share')
  
  // 实现分享功能
  if (navigator.share) {
    // 使用 Web Share API
    navigator.share({
      title: newsDetail.value.title,
      text: newsDetail.value.content?.substring(0, 100) || '',
      url: shareUrl
    })
  } else {
    // 降级方案：复制链接到剪贴板
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('链接已复制到剪贴板')
      })
      .catch(err => {
        console.error('复制链接失败:', err)
      })
  }
}

// 记录点赞
const handleLike = () => {
  if (!newsDetail.value) return
  recordInteraction(newsDetail.value, 'like')
}

// 格式化时间
const formatTime = (timeString: string) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化相对时间
const formatRelativeTime = (timeString: string) => {
  const now = new Date()
  const past = new Date(timeString)
  const diff = now.getTime() - past.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到新闻详情
const goToNewsDetail = (news: NewsItem) => {
  router.push({
    path: `/news/${news.id}`,
    query: { platform: news.platform || '' }
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchNewsDetail()
})
</script>

<template>
  <div class="news-detail-page">
    <!-- 顶部导航栏 -->
    <header class="detail-header">
      <div class="header-content">
        <button 
          class="back-button" 
          @click="goBack"
          aria-label="返回上一页"
        >
          <ArrowLeft class="h-5 w-5" />
        </button>
        <h1 class="page-title">新闻详情</h1>
        <div class="header-actions">
          <button 
            class="action-button"
            @click="shareNews"
            aria-label="分享新闻"
          >
            <Share2 class="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="detail-main">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">加载中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <h2 class="error-title">加载失败</h2>
        <p class="error-message">{{ error }}</p>
        <button class="retry-button" @click="fetchNewsDetail">重试</button>
      </div>
      
      <!-- 新闻内容 -->
      <div v-else-if="newsDetail" class="news-content">
        <!-- 新闻头部信息 -->
        <div class="news-header">
          <h1 class="news-title">{{ newsDetail.title }}</h1>
          
          <!-- 新闻元信息 -->
          <div class="news-meta">
            <div class="meta-item">
              <Calendar class="h-4 w-4" />
              <span>{{ formatTime(newsDetail.publishedAt || '') }}</span>
            </div>
            <div class="meta-item">
              <Clock class="h-4 w-4" />
              <span>{{ formatRelativeTime(newsDetail.publishedAt || '') }}</span>
            </div>
            <div class="meta-item">
              <Globe class="h-4 w-4" />
              <span>{{ newsDetail.platform || '未知平台' }}</span>
            </div>
          </div>
          
          <!-- 新闻来源和平台图标 -->
          <div class="news-source">
            <div class="source-icon">
              <component :is="getPlatformIcon(newsDetail.platform || '')" class="h-5 w-5" />
            </div>
            <span class="source-name">{{ newsDetail.source || '未知来源' }}</span>
          </div>
        </div>
        
        <!-- 新闻正文 -->
        <div class="news-body">
          <!-- 新闻缩略图 -->
          <div v-if="newsDetail.image" class="news-image">
            <img :src="newsDetail.image" :alt="newsDetail.title" loading="lazy" />
          </div>
          
          <!-- 新闻内容 -->
          <div class="news-text">
            <p>{{ newsDetail.content || '暂无内容' }}</p>
          </div>
        </div>
        
        <!-- 新闻互动区 -->
        <div class="news-interactions">
          <button 
            class="interaction-button"
            @click="handleLike"
            aria-label="点赞"
          >
            <ThumbsUp class="h-5 w-5" />
            <span>{{ newsDetail.engagement?.likeCount || 0 }}</span>
          </button>
          <button 
            class="interaction-button"
            @click="shareNews"
            aria-label="分享"
          >
            <Share2 class="h-5 w-5" />
            <span>{{ newsDetail.engagement?.shareCount || 0 }}</span>
          </button>
          <div class="interaction-button">
            <MessageCircle class="h-5 w-5" />
            <span>{{ newsDetail.engagement?.commentCount || 0 }}</span>
          </div>
          <div class="interaction-button">
            <Eye class="h-5 w-5" />
            <span>{{ newsDetail.engagement?.readCount || 0 }}</span>
          </div>
          <button 
            class="interaction-button favorite-button"
            @click="toggleFavorite"
            :aria-label="isFavoriteNews ? '取消收藏' : '收藏'"
          >
            <template v-if="isFavoriteNews">
              <BookmarkCheck class="h-5 w-5" />
              <span>已收藏</span>
            </template>
            <template v-else>
              <Bookmark class="h-5 w-5" />
              <span>收藏</span>
            </template>
          </button>
        </div>
        
        <!-- 相关推荐 -->
        <div v-if="relatedNews.length > 0" class="related-news">
          <h2 class="related-title">相关推荐</h2>
          <div class="related-list">
            <div 
              v-for="news in relatedNews" 
              :key="news.id"
              class="related-item"
              @click="goToNewsDetail(news)"
            >
              <div class="related-content">
                <h3 class="related-news-title">{{ news.title }}</h3>
                <div class="related-meta">
                  <span class="related-source">{{ news.source || '未知来源' }}</span>
                  <span class="related-time">{{ formatRelativeTime(news.publishedAt || '') }}</span>
                </div>
              </div>
              <ChevronRight class="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 全局样式 */
.news-detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background);
  color: var(--foreground);
}

/* 头部样式 */
.detail-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--background);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--muted);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--foreground);
}

.back-button:hover {
  background-color: var(--accent);
  color: var(--background);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--muted);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--foreground);
}

.action-button:hover {
  background-color: var(--accent);
  color: var(--background);
}

/* 主内容区 */
.detail-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--muted);
  border-top: 3px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--muted-foreground);
  font-size: 16px;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--destructive);
}

.error-message {
  color: var(--muted-foreground);
  margin-bottom: 24px;
  max-width: 500px;
}

.retry-button {
  padding: 10px 20px;
  background-color: var(--accent);
  color: var(--background);
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background-color: var(--accent-foreground);
}

/* 新闻内容 */
.news-content {
  background-color: var(--background);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 新闻头部 */
.news-header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.news-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 16px;
  color: var(--foreground);
}

/* 新闻元信息 */
.news-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted-foreground);
  font-size: 14px;
}

/* 新闻来源 */
.news-source {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted-foreground);
  font-size: 14px;
}

.source-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--muted);
  border-radius: 50%;
}

/* 新闻正文 */
.news-body {
  padding: 24px;
}

/* 新闻图片 */
.news-image {
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* 新闻文本 */
.news-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--foreground);
}

.news-text p {
  margin-bottom: 16px;
}

/* 新闻互动区 */
.news-interactions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background-color: var(--muted);
  flex-wrap: wrap;
}

.interaction-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--foreground);
  font-size: 14px;
}

.interaction-button:hover {
  background-color: var(--accent);
  color: var(--background);
  border-color: var(--accent);
}

.favorite-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--foreground);
  font-size: 14px;
}

.favorite-button:hover {
  background-color: var(--accent);
  color: var(--background);
  border-color: var(--accent);
}

/* 相关推荐 */
.related-news {
  padding: 24px;
  border-top: 1px solid var(--border);
  background-color: var(--muted);
}

.related-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--foreground);
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.related-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: var(--accent);
}

.related-content {
  flex: 1;
  margin-right: 12px;
}

.related-news-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 8px;
  color: var(--foreground);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--muted-foreground);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-main {
    padding: 12px;
  }
  
  .news-header {
    padding: 16px;
  }
  
  .news-title {
    font-size: 22px;
  }
  
  .news-meta {
    gap: 12px;
  }
  
  .news-body {
    padding: 16px;
  }
  
  .news-interactions {
    padding: 12px 16px;
    gap: 12px;
  }
  
  .interaction-button {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .related-news {
    padding: 16px;
  }
  
  .related-item {
    padding: 12px;
  }
  
  .related-news-title {
    font-size: 15px;
  }
}
</style>