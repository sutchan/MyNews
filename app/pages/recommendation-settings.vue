<template>
  <UiSidebarProvider>
    <AppSidebar/>
    <UiSidebarInset class="flex flex-col h-screen">
      <!-- 页面头部 -->
      <header
          class="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex items-center gap-2 px-4">
          <UiSidebarTrigger class="-ml-1"/>
          <UiSeparator orientation="vertical" class="mr-2 h-4"/>
          <UiBreadcrumb>
            <UiBreadcrumbList>
              <UiBreadcrumbItem class="hidden md:block">
                <UiBreadcrumbLink href="/" class="text-muted-foreground">
                  首页
                </UiBreadcrumbLink>
              </UiBreadcrumbItem>
              <UiBreadcrumbSeparator class="hidden md:block"/>
              <UiBreadcrumbItem>
                <UiBreadcrumbPage class="text-foreground font-medium">推荐设置</UiBreadcrumbPage>
              </UiBreadcrumbItem>
            </UiBreadcrumbList>
          </UiBreadcrumb>
        </div>
      </header>
      <UiSeparator/>

      <!-- 主内容区域 -->
      <div class="flex-1 overflow-hidden">
        <UiScrollArea class="h-full">
          <div class="p-4 max-w-3xl mx-auto">
            <h1 class="text-2xl font-bold mb-6">推荐设置</h1>
            
            <!-- 用户兴趣管理 -->
            <div class="mb-8 bg-card rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold mb-4">兴趣管理</h2>
              
              <!-- 已选兴趣标签 -->
              <div class="mb-6">
                <h3 class="text-sm font-medium text-muted-foreground mb-3">您已选择的兴趣</h3>
                <div class="flex flex-wrap gap-2" v-if="userInterests.length > 0">
                  <div 
                    v-for="interest in userInterests" 
                    :key="interest.tag"
                    class="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-sm"
                  >
                    <span>{{ interest.tag }}</span>
                    <button 
                      class="ml-1 text-muted-foreground hover:text-foreground"
                      @click="removeInterest(interest.tag)"
                      aria-label="移除兴趣"
                    >
                      <X class="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p class="text-sm text-muted-foreground italic" v-else>
                  您还没有选择任何兴趣，推荐内容将基于热门趋势和综合数据。
                </p>
              </div>
              
              <!-- 兴趣选择器 -->
              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-3">选择您感兴趣的标签</h3>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="tag in recommendedTags"
                    :key="tag"
                    :class="[
                      'px-3 py-1 text-sm rounded-full transition-all',
                      isSelected(tag) 
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-muted hover:bg-muted/80 border border-muted-foreground/10'
                    ]"
                    @click="toggleInterest(tag)"
                  >
                    {{ tag }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 推荐配置 -->
            <div class="mb-8 bg-card rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold mb-4">推荐配置</h2>
              
              <div class="space-y-4">
                <!-- 使用用户兴趣 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-medium">根据兴趣推荐</h3>
                    <p class="text-sm text-muted-foreground">基于您的兴趣标签提供个性化内容</p>
                  </div>
                  <UiSwitch 
                    v-model="config.useUserInterests"
                    @change="updateConfig"
                  />
                </div>
                
                <!-- 使用热门趋势 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-medium">包含热点内容</h3>
                    <p class="text-sm text-muted-foreground">在推荐中包含当前热门内容</p>
                  </div>
                  <UiSwitch 
                    v-model="config.useHotTrends"
                    @change="updateConfig"
                  />
                </div>
                
                <!-- 内容多样性 -->
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-medium">内容多样性</h3>
                    <p class="text-sm text-muted-foreground">平衡热门内容和小众兴趣</p>
                  </div>
                  <UiSwitch 
                    v-model="config.useDiversity"
                    @change="updateConfig"
                  />
                </div>
                
                <!-- 最大结果数 -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <h3 class="font-medium">最大推荐数量</h3>
                      <p class="text-sm text-muted-foreground">每页显示的推荐内容数量</p>
                    </div>
                    <span class="font-mono text-sm">{{ config.maxResults }}</span>
                  </div>
                  <UiSlider
                    v-model="config.maxResults"
                    :min="5"
                    :max="50"
                    :step="5"
                    @change="updateConfig"
                  />
                </div>
                
                <!-- 推荐刷新频率 -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <h3 class="font-medium">推荐刷新频率</h3>
                      <p class="text-sm text-muted-foreground">自动刷新推荐内容的时间间隔（分钟）</p>
                    </div>
                    <span class="font-mono text-sm">{{ config.refreshInterval / 60000 }}分钟</span>
                  </div>
                  <UiSlider
                    v-model="config.refreshInterval"
                    :min="300000"
                    :max="3600000"
                    :step="300000"
                    @change="updateConfig"
                  />
                </div>
              </div>
            </div>
            
            <!-- 兴趣权重配置 -->
            <div class="mb-8 bg-card rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold mb-4">兴趣权重调整</h2>
              <p class="text-sm text-muted-foreground mb-4">
                调整不同兴趣的权重，权重越高的兴趣会获得更多的内容推荐
              </p>
              
              <div class="space-y-4" v-if="userInterests.length > 0">
                <div 
                  v-for="interest in userInterests" 
                  :key="interest.tag"
                  class="p-3 bg-muted/50 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-medium">{{ interest.tag }}</h3>
                    <span class="text-sm text-muted-foreground">
                      权重: {{ Math.round(interest.weight * 100) }}%
                    </span>
                  </div>
                  <UiSlider
                    v-model="interest.weight"
                    :min="0.1"
                    :max="1"
                    :step="0.1"
                    @change="updateInterestWeights"
                  />
                </div>
              </div>
              
              <div v-else class="p-6 text-center text-muted-foreground">
                <AlertCircle class="mx-auto h-10 w-10 mb-3" />
                <p>请先选择您的兴趣标签</p>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex justify-between">
              <UiButton variant="outline" @click="resetToDefaults">
                <RefreshCw class="h-4 w-4 mr-2" />
                重置为默认
              </UiButton>
              <UiButton @click="saveAndApply">
                <Check class="h-4 w-4 mr-2" />
                保存并应用
              </UiButton>
            </div>
          </div>
        </UiScrollArea>
      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useHead } from '@unhead/vue'
import { 
  X, AlertCircle, RefreshCw, Check 
} from 'lucide-vue-next'
import { useRecommendations } from '@/composables/useRecommendations'
import AppSidebar from '@/components/AppSidebar.vue'

// 设置页面SEO
useHead({
  title: '推荐设置 | 今日时事',
  meta: [
    { name: 'description', content: '管理您的个性化推荐设置和兴趣标签' },
    { property: 'og:title', content: '推荐设置 | 今日时事' },
    { property: 'og:description', content: '管理您的个性化推荐设置和兴趣标签' }
  ]
})

// 使用推荐功能
const { 
  userInterests, 
  config, 
  addUserInterest: addInterest, 
  removeUserInterest: removeInterest, 
  setConfig: updateRecommendConfig,
  resetConfig,
  refreshUserInterests: updateWeights
} = useRecommendations()

// 推荐的兴趣标签列表
const recommendedTags = [
  '科技', '人工智能', '区块链', '前端开发', '后端开发', '移动开发',
  '财经', '股票', '基金', '数字货币', '房地产', '创业',
  '体育', '足球', '篮球', '电子竞技', '健身',
  '娱乐', '电影', '音乐', '游戏', '明星',
  '汽车', '新能源', '自动驾驶', '电动车',
  '健康', '医疗', '营养', '心理',
  '教育', '职场', '学习方法', '留学',
  '生活方式', '旅行', '美食', '摄影', '阅读',
  '社会', '时事', '环保', '公益',
  '艺术', '设计', '时尚', '建筑'
]

// 检查标签是否已选中
const isSelected = (tag: string): boolean => {
  return userInterests.value.some(interest => interest.tag === tag)
}

// 切换兴趣选择
const toggleInterest = (tag: string) => {
  if (isSelected(tag)) {
    removeInterest(tag)
  } else {
    addInterest(tag)
  }
}

// 更新配置
const updateConfig = () => {
  updateRecommendConfig({ ...config.value })
}

// 更新兴趣权重
const updateInterestWeights = () => {
  updateWeights(userInterests.value)
}

// 重置为默认设置
const resetToDefaults = () => {
  if (confirm('确定要重置所有推荐设置为默认值吗？这将清除您的兴趣标签和自定义配置。')) {
    resetConfig()
  }
}

// 保存并应用设置
const saveAndApply = () => {
  updateConfig()
  updateInterestWeights()
  // 可以添加一个成功提示
}
</script>

<style scoped>
/* 自定义滑块样式 */
:deep(.ui-slider-track) {
  background-color: var(--ui-color-background);
}

:deep(.ui-slider-thumb) {
  transition: all 0.2s ease;
}

:deep(.ui-slider-thumb:hover) {
  transform: scale(1.1);
}

/* 兴趣标签动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .space-y-4 > div {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .flex.items-center.justify-between {
    flex-direction: row;
  }
}
</style>
