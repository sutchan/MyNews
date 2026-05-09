<!-- app/components/AISummary.vue v2.0.0 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Sparkles, Clock, RefreshCw, ChevronDown, ChevronUp, Hash, AlertCircle } from 'lucide-vue-next'
import { fetchAISummary } from '~/api/ai'
import type { AISummaryData } from '~/api/ai'
import AISummaryDialog from './AISummaryDialog.vue'
import Card from './ui/card/Card.vue'
import CardContent from './ui/card/CardContent.vue'
import CardHeader from './ui/card/CardHeader.vue'
import CardTitle from './ui/card/CardTitle.vue'

// Props定义
interface Props {
  expanded?: boolean
  refreshInterval?: number
  category?: string
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  refreshInterval: 60000,
  category: 'all'
})

// 类型定义
interface SummaryData extends AISummaryData {
  hotTopics?: {
    topic: string
    description: string
    relatedPlatforms?: string[]
  }[]
  trends?: {
    title: string
    description: string
  }[]
  category?: string
  title?: string
  content?: string
  updatedAt: number
  sections?: any[]
}

const emit = defineEmits<{
  'update:expanded': [value: boolean]
  'refresh': []
}>()

// 响应式数据定义
const isLoading = ref(false)
const error = ref<string | null>(null)
const summaryData = ref<SummaryData>({
  title: '',
  content: '',
  sections: [],
  updatedAt: Date.now(),
  hotTopics: [],
  trends: []
})
const isExpanded = ref(props.expanded)
const dialogOpen = ref(false)
let refreshTimer: number | null = null

// 监听expanded属性变化
watch(() => props.expanded, (newVal) => {
  isExpanded.value = newVal
})

// 格式化时间
const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) {
    return `${Math.floor(diff / 1000)}秒前`
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }
}

// 生成模拟数据
const generateMockData = (category: string): AISummaryData => {
  const mockHotTopics = [
    {
      topic: `热门话题 ${category.charAt(0).toUpperCase() + category.slice(1)} 1`,
      description: `这是关于${category}领域的第一个热门话题，包含了最新的行业动态和重要事件。`,
      relatedPlatforms: ['weibo', 'zhihu', 'toutiao']
    },
    {
      topic: `热门话题 ${category.charAt(0).toUpperCase() + category.slice(1)} 2`,
      description: `这是关于${category}领域的第二个热门话题，讨论了未来的发展趋势和机遇挑战。`,
      relatedPlatforms: ['douban', 'bilibili']
    },
    {
      topic: `热门话题 ${category.charAt(0).toUpperCase() + category.slice(1)} 3`,
      description: `这是关于${category}领域的第三个热门话题，聚焦于具体技术创新和应用案例。`,
      relatedPlatforms: ['github', 'juejin']
    }
  ]

  const mockTrends = [
    {
      title: `${category}领域趋势 1`,
      description: `分析显示，${category}领域正在经历重大变革，新技术和新模式的出现正在重塑整个行业格局。`
    },
    {
      title: `${category}领域趋势 2`,
      description: `市场研究表明，消费者需求正在发生转变，这将推动${category}相关企业调整战略方向。`
    }
  ]

  return {
    category,
    generatedAt: new Date().toISOString(),
    summary: `这是关于${category}领域的AI智能摘要。通过分析海量信息源，我们提取了当前${category}领域的核心内容，包括最新发展动态、市场趋势、技术创新和热点事件等。本摘要旨在帮助用户快速了解${category}领域的整体情况，把握行业脉搏。`,
    hotTopics: mockHotTopics,
    trends: mockTrends
  }
}

// 加载摘要数据
const loadSummary = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const category = props.category || 'all'
    const data = await fetchAISummary(category)
    summaryData.value = {
      ...data,
      title: props.category === 'all' ? '综合AI摘要' : `${props.category}AI摘要`,
      content: data.summary || '暂无摘要内容',
      sections: data.sections || [],
      updatedAt: Date.now(),
      hotTopics: data.hotTopics || [],
      trends: data.trends || []
    }
    emit('refresh')
  } catch (err) {
    console.error('加载AI摘要失败:', err)
    // 设置错误信息
    error.value = 'AI服务暂时不可用，显示模拟数据'
    // 使用模拟数据作为后备
    const mockData = generateMockData(props.category || 'all')
    summaryData.value = {
      ...mockData,
      title: props.category === 'all' ? '综合AI摘要' : `${props.category}AI摘要`,
      content: mockData.summary,
      updatedAt: Date.now()
    }
  } finally {
    isLoading.value = false
  }
}

// 切换展开状态
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  emit('update:expanded', isExpanded.value)
}

// 打开详情对话框
const openDetails = () => {
  dialogOpen.value = true
}

// 设置定时刷新
const setupRefreshTimer = () => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
  }
  
  if (props.refreshInterval > 0) {
    refreshTimer = window.setInterval(() => {
      loadSummary()
    }, props.refreshInterval)
  }
}

// 监听属性变化
watch(() => props.category, () => {
  loadSummary()
})

watch(() => props.refreshInterval, () => {
  setupRefreshTimer()
})

// 生命周期钩子
onMounted(() => {
  // 初始加载
  loadSummary()
  
  // 设置定时刷新
  setupRefreshTimer()
})

onUnmounted(() => {
  // 清理定时器
  if (refreshTimer !== null) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<template>
  <div class="rounded-lg border bg-card shadow-sm overflow-hidden">
    <div class="p-4 border-b flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Sparkles class="h-5 w-5 text-primary" />
        <h3 class="font-medium text-base">{{ summaryData.title }}</h3>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="loadSummary" 
          :disabled="isLoading"
          class="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="刷新摘要"
        >
          <RefreshCw 
            class="h-4 w-4 text-muted-foreground" 
            :class="{ 'animate-spin': isLoading }"
          />
        </button>
        <button 
          @click="toggleExpanded" 
          class="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="展开/收起"
        >
          <ChevronDown 
            v-if="isExpanded" 
            class="h-4 w-4 text-muted-foreground" 
          />
          <ChevronUp 
            v-else 
            class="h-4 w-4 text-muted-foreground" 
          />
        </button>
      </div>
    </div>
    
    <div class="p-4">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex justify-center items-center py-6">
        <div class="flex flex-col items-center gap-2">
          <RefreshCw class="h-5 w-5 text-muted-foreground animate-spin" />
          <span class="text-sm text-muted-foreground">正在生成摘要...</span>
        </div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-6 text-destructive text-sm">
        {{ error }}
        <button 
          @click="loadSummary" 
          class="mt-2 px-3 py-1 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
        >
          重新加载
        </button>
      </div>
      
      <!-- 摘要内容 -->
      <div v-else-if="summaryData.content" class="space-y-4">
        <!-- 总体概述 -->
        <div class="bg-muted/30 p-4 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <Hash class="w-4 h-4 text-primary" />
            <h4 class="font-medium text-sm">总体概述</h4>
          </div>
          <p class="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {{ summaryData.content }}
          </p>
        </div>
        
        <div 
          v-if="isExpanded" 
          class="space-y-6"
        >
          <!-- 热门话题 -->
          <div v-if="summaryData.hotTopics && summaryData.hotTopics.length > 0">
            <div class="flex items-center gap-2 mb-3">
              <Hash class="w-4 h-4 text-primary" />
              <h4 class="font-medium text-base">热门话题</h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                v-for="(topic, index) in summaryData.hotTopics.slice(0, 2)" 
                :key="index"
                class="p-3 bg-card border rounded-md hover:bg-muted/20 transition-colors"
              >
                <div class="flex justify-between items-start mb-2">
                  <h5 class="font-medium text-sm">{{ topic.topic }}</h5>
                  <span class="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                    热度 {{ index + 1 }}
                  </span>
                </div>
                <p class="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {{ topic.description }}
                </p>
                <div v-if="topic.relatedPlatforms && topic.relatedPlatforms.length > 0" class="flex flex-wrap gap-1">
                  <span 
                    v-for="(platform, idx) in topic.relatedPlatforms.slice(0, 3)" 
                    :key="idx"
                    class="px-2 py-0.5 text-xs bg-muted rounded-full"
                  >
                    {{ platform }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 趋势分析 -->
          <div v-if="summaryData.trends && summaryData.trends.length > 0">
            <div class="flex items-center gap-2 mb-3">
              <Hash class="w-4 h-4 text-primary" />
              <h4 class="font-medium text-base">趋势分析</h4>
            </div>
            <div class="space-y-2">
              <div 
                v-for="(trend, index) in summaryData.trends.slice(0, 2)" 
                :key="index"
                class="p-3 bg-card border rounded-md hover:bg-muted/20 transition-colors"
              >
                <h5 class="font-medium text-sm mb-1">{{ trend.title }}</h5>
                <p class="text-xs text-muted-foreground line-clamp-2">
                  {{ trend.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center justify-between mt-2">
          <div class="text-xs text-muted-foreground flex items-center gap-1">
            <Clock class="h-3 w-3" />
            <span>{{ formatTime(summaryData.updatedAt) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button 
              v-if="!isExpanded && summaryData.content.length > 100"
              @click="toggleExpanded" 
              class="text-primary text-xs hover:underline"
            >
              {{ isExpanded ? '收起' : '展开' }}
            </button>
            <button 
              @click="openDetails"
              class="text-primary text-xs hover:underline"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
      
      <!-- 无数据状态 -->
      <div v-else class="text-center py-4 text-muted-foreground">
        暂无摘要数据
      </div>
    </div>
  </div>
  
  <!-- AI摘要详情对话框 -->
  <AISummaryDialog 
    v-model:open="dialogOpen" 
    :category="props.category"
    :category-title="summaryData.title"
  />
</template>