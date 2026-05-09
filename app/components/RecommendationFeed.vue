<!-- app/components/RecommendationFeed.vue v2.0.0 -->
<template>
  <div class="recommendation-feed">
    <!-- 推荐说明区域 -->
    <div class="recommendation-header" v-if="recommendationExplanation">
      <div class="explanation-icon">
        <SparklesIcon class="h-5 w-5" />
      </div>
      <p class="explanation-text">{{ recommendationExplanation }}</p>
      <button 
        class="config-button" 
        @click="showConfig = !showConfig"
        aria-label="推荐设置"
      >
        <Settings2Icon class="h-4 w-4" />
      </button>
    </div>

    <!-- 配置面板 -->
    <div class="config-panel" v-if="showConfig">
      <h4 class="config-title">推荐设置</h4>
      
      <div class="config-item">
        <label class="config-label">
          <input 
            type="checkbox" 
            v-model="localConfig.useUserInterests"
            @change="updateConfig"
          >
          根据兴趣推荐
        </label>
      </div>
      
      <div class="config-item">
        <label class="config-label">
          <input 
            type="checkbox" 
            v-model="localConfig.useHotTrends"
            @change="updateConfig"
          >
          包含热点内容
        </label>
      </div>
      
      <div class="config-item">
        <label class="config-label">
          <input 
            type="checkbox" 
            v-model="localConfig.useDiversity"
            @change="updateConfig"
          >
          保持内容多样性
        </label>
      </div>
      
      <div class="config-item">
        <label class="config-label">
          最大推荐数量: 
          <input 
            type="number" 
            v-model.number="localConfig.maxResults"
            @change="updateConfig"
            min="5" 
            max="50"
            class="config-input"
          >
        </label>
      </div>
      
      <div class="config-actions">
        <button class="reset-button" @click="resetToDefaults">重置默认</button>
      </div>
    </div>

    <!-- 兴趣标签云 -->
    <div class="interest-tags" v-if="userInterests.length > 0 && showConfig">
      <h4 class="tags-title">您的兴趣</h4>
      <div class="tags-container">
        <span 
          v-for="interest in interestTags" 
          :key="interest.tag"
          class="interest-tag"
          :style="{ fontSize: `${interest.fontSize}px`, color: interest.color }"
          :title="`兴趣度: ${Math.round(interest.weight * 100)}%`"
        >
          {{ interest.tag }}
        </span>
      </div>
    </div>

    <!-- 内容列表 -->
    <div class="news-list" v-if="!isLoading || recommendations.length > 0">
      <div 
        v-for="news in recommendations" 
        :key="news.id"
        class="news-item"
        @click="handleNewsClick(news)"
      >
        <div class="news-content">
          <h3 class="news-title">{{ news.title }}</h3>
          <p class="news-description">{{ truncateText(news.content, 100) }}</p>
          <div class="news-meta">
            <span class="news-source">{{ news.source }}</span>
            <span class="news-time">{{ formatTime(news.publishedAt) }}</span>
            <span class="news-platform">{{ formatPlatform(news.platform) }}</span>
          </div>
          <div class="news-engagement">
            <span class="engagement-item">
              <EyeIcon class="h-3 w-3" />
              {{ formatCount(news.engagement.readCount) }}
            </span>
            <span class="engagement-item">
              <MessageCircleIcon class="h-3 w-3" />
              {{ formatCount(news.engagement.commentCount) }}
            </span>
            <span class="engagement-item">
              <Share2Icon class="h-3 w-3" />
              {{ formatCount(news.engagement.shareCount) }}
            </span>
          </div>
        </div>
        <div class="news-image">
          <img :src="news.image" :alt="news.title" loading="lazy" />
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading">
      <!-- 骨架屏加载状态 -->
      <div class="skeleton-container" v-if="recommendations.length === 0">
        <div v-for="i in 3" :key="`skeleton-${i}`" class="news-item skeleton-item">
          <div class="news-content">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line description"></div>
            <div class="skeleton-line description"></div>
            <div class="skeleton-meta">
              <div class="skeleton-line meta"></div>
              <div class="skeleton-line meta"></div>
            </div>
            <div class="skeleton-engagement">
              <div class="skeleton-line engagement"></div>
              <div class="skeleton-line engagement"></div>
              <div class="skeleton-line engagement"></div>
            </div>
          </div>
          <div class="news-image">
            <div class="skeleton-image"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div class="error-container" v-if="error && recommendations.length === 0">
      <AlertTriangleIcon class="h-8 w-8" />
      <p class="error-text">{{ error }}</p>
      <button class="retry-button" @click="() => loadRecommendations({ forceRefresh: true })">重试</button>
    </div>

    <!-- 空状态 -->
    <div class="empty-container" v-if="!isLoading && !error && recommendations.length === 0">
      <BookOpenIcon class="h-8 w-8" />
      <p class="empty-text">暂无推荐内容</p>
      <button class="refresh-button" @click="() => loadRecommendations({ forceRefresh: true })">刷新</button>
    </div>

    <!-- 加载更多状态 -->
    <div v-if="recommendations.length > 0">
      <!-- 正在加载状态 -->
      <div class="loading-more" v-if="isLoading && currentPage > 1">
        <div class="loading-spinner small"></div>
        <span class="loading-text small">正在加载更多内容...</span>
      </div>
      
      <!-- 加载更多触发器 -->
      <div 
        class="load-more-trigger" 
        ref="loadMoreTrigger"
        v-if="hasMore && (!isLoading || currentPage <= 1)"
      ></div>
      
      <!-- 无更多内容提示 -->
      <div class="no-more" v-if="!hasMore && recommendations.length > 0">
        <span class="no-more-text">已经到底啦~</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRecommendations } from '@/composables/useRecommendations'
import { useRouter } from 'vue-router'
import { 
  SparklesIcon, 
  Settings2Icon, 
  EyeIcon, 
  MessageCircleIcon, 
  Share2Icon, 
  AlertTriangleIcon, 
  BookOpenIcon 
} from 'lucide-vue-next'
import type { NewsItem } from '@/api/news'
import type { RecommendationConfig } from '@/api/recommendation'

// 路由
const router = useRouter()

// 推荐相关状态和方法
const {
  recommendedNews: recommendations,
  userInterests,
  interestTags,
  isLoading,
  error,
  recommendationExplanation,
  config,
  loadRecommendations,
  recordInteraction: recordRecommendationInteraction,
  setConfig,
  resetConfig
} = useRecommendations()

// 组件状态
const showConfig = ref(false)
const localConfig = ref<RecommendationConfig>({ ...config.value })
const loadMoreTrigger = ref<HTMLElement>()
const observer = ref<IntersectionObserver | null>(null)
const hasMore = ref(true)

// 监听配置变化
watch(() => config.value, (newConfig) => {
  localConfig.value = { ...newConfig }
}, { deep: true })

// 更新配置
const updateConfig = () => {
  setConfig(localConfig.value)
  loadRecommendations()
}

// 重置为默认配置
const resetToDefaults = () => {
  resetConfig()
  loadMoreTrigger.value = undefined
  hasMore.value = true
}

// 处理新闻点击
const handleNewsClick = (news: NewsItem) => {
  // 记录浏览行为 - 传递完整的news对象
  recordRecommendationInteraction(news, 'view')
  
  // 导航到新闻详情页 - 安全访问platform属性
  router.push({ 
    path: `/news/${news.id}`, 
    query: { platform: (news as any).platform || '' } 
  })
}

// 截断文本
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 格式化时间
const formatTime = (timeString: string): string => {
  const now = new Date()
  const publishedAt = new Date(timeString)
  const diffInSeconds = Math.floor((now.getTime() - publishedAt.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前`
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`
  } else {
    return `${Math.floor(diffInSeconds / 86400)}天前`
  }
}

// 格式化平台名称
const formatPlatform = (platform: string): string => {
  const platformMap: Record<string, string> = {
    'tech': '科技',
    'finance': '财经',
    'sports': '体育',
    'entertainment': '娱乐',
    'car': '汽车',
    'social': '社交',
    'hot': '热点'
  }
  
  return platformMap[platform] || platform
}

// 格式化数字
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 设置无限滚动
const setupInfiniteScroll = () => {
  if (!loadMoreTrigger.value) return
  
  observer.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting && hasMore.value && !isLoading.value) {
        // 实现分页加载更多功能
        loadMoreRecommendations()
      }
    },
    {
      rootMargin: '100px',
      threshold: 0.1
    }
  )
  
  observer.value.observe(loadMoreTrigger.value)
}

// 加载更多推荐内容
const loadMoreRecommendations = async () => {
  if (isLoading.value || !hasMore.value) return
  
  try {
    // 增加页码并加载更多内容
    currentPage.value++
    
    // 调用加载更多方法
    await loadRecommendations({
      page: currentPage.value,
      pageSize: pageSize.value,
      append: true // 追加模式，不替换现有内容
    })
    
    // 检查是否还有更多内容（如果新加载的数量少于请求的数量，则认为没有更多了）
    if (recommendations.value.length % pageSize.value !== 0) {
      hasMore.value = false
    }
  } catch (err) {
    console.error('加载更多推荐失败:', err)
    // 加载失败时回滚页码
    currentPage.value--
  }
}

// 清理观察者
const cleanupObserver = () => {
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
}

// 生命周期钩子
onMounted(() => {
  // 初始加载
  if (recommendations.value.length === 0) {
    loadRecommendations()
  }
  
  // 设置无限滚动
  setupInfiniteScroll()
})

// 监听加载更多触发器的变化
watch(loadMoreTrigger, () => {
  cleanupObserver()
  setupInfiniteScroll()
})

onUnmounted(() => {
  cleanupObserver()
})
</script>

<style scoped>
.recommendation-feed {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 推荐头部 */
.recommendation-header {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.explanation-icon {
  margin-right: 10px;
}

.explanation-text {
  flex: 1;
  margin: 0;
  font-size: 14px;
}

.config-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.config-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 配置面板 */
.config-panel {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.config-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #374151;
}

.config-item {
  margin-bottom: 12px;
}

.config-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.config-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-left: 8px;
}

.config-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.reset-button {
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background: #e5e7eb;
}

/* 兴趣标签 */
.interest-tags {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.tags-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #0369a1;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  line-height: 1.8;
}

.interest-tag {
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.interest-tag:hover {
  transform: scale(1.05);
}

/* 新闻列表 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-item {
  display: flex;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.news-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.news-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.news-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  flex: 1;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #6b7280;
}

.news-platform {
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
}

.news-engagement {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.engagement-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.news-image {
  width: 200px;
  flex-shrink: 0;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.news-item:hover .news-image img {
  transform: scale(1.05);
}

/* 状态容器 */
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

/* 骨架屏样式 */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  opacity: 0.7;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-line.title {
  height: 24px;
  width: 80%;
  margin-bottom: 12px;
}

.skeleton-line.description {
  height: 16px;
  width: 100%;
}

.skeleton-line.meta {
  height: 14px;
  width: 30%;
  display: inline-block;
  margin-right: 12px;
}

.skeleton-line.engagement {
  height: 14px;
  width: 15%;
  display: inline-block;
  margin-right: 12px;
}

.skeleton-meta,
.skeleton-engagement {
  margin-top: 8px;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.loading-text,
.error-text,
.empty-text {
  color: #6b7280;
  margin: 0 0 16px 0;
}

.retry-button,
.refresh-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-button:hover,
.refresh-button:hover {
  background: #5a67d8;
}

/* 加载更多触发器 */
.load-more-trigger {
  height: 40px;
}

/* 加载更多状态 */
.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6b7280;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  margin-bottom: 8px;
}

.loading-text.small {
  font-size: 14px;
  margin: 0;
}

/* 无更多内容提示 */
.no-more {
  display: flex;
  justify-content: center;
  padding: 30px;
  color: #9ca3af;
  font-size: 14px;
  border-top: 1px solid #e5e7eb;
  margin-top: 16px;
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .news-item {
    flex-direction: column;
  }
  
  .news-image {
    width: 100%;
    height: 200px;
  }
  
  .news-meta {
    flex-wrap: wrap;
  }
}
</style>
