<!-- app/components/AISummaryDialog.vue v2.0.0 -->
<script setup lang="ts">
import {ref, watch} from 'vue'
import {Sparkles, TrendingUp, Hash, Loader2, AlertCircle} from 'lucide-vue-next'
import type {AISummaryData} from '~/api/ai'
import {fetchAISummary} from '~/api/ai'
import {getTitle} from "@/config/platforms";

// 导入UI组件
import Dialog from './ui/dialog/Dialog.vue';
import DialogContent from './ui/dialog/DialogContent.vue';
import DialogHeader from './ui/dialog/DialogHeader.vue';
import DialogTitle from './ui/dialog/DialogTitle.vue';
import DialogDescription from './ui/dialog/DialogDescription.vue';
import DialogFooter from './ui/dialog/DialogFooter.vue';
import Card from './ui/card/Card.vue';
import CardHeader from './ui/card/CardHeader.vue';
import CardTitle from './ui/card/CardTitle.vue';
import CardContent from './ui/card/CardContent.vue';
import Button from './ui/button/Button.vue';
import Badge from './ui/badge/Badge.vue';
import Separator from './ui/separator/Separator.vue';

interface Props {
  category: string
  categoryTitle: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const open = defineModel<boolean>('open', {default: false})
const loading = ref(false)
const error = ref<string | null>(null)
const summaryData = ref<AISummaryData | null>(null)

// 监听弹窗打开状态，自动加载数据
watch(open, async (isOpen) => {
  if (isOpen && !summaryData.value) {
    await loadAISummary()
  }
})

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

  const mockSections = [
    {
      title: `${category}领域重点关注`,
      content: `本部分详细分析了${category}领域的重点发展方向，包括技术创新、市场变化和政策环境等多个维度。通过对这些因素的综合考量，可以更好地把握行业发展脉络，为决策提供参考依据。`,
      platforms: ['weibo', 'zhihu']
    },
    {
      title: `${category}领域风险提示`,
      content: `在关注机遇的同时，我们也需要警惕${category}领域可能面临的各种风险和挑战。包括技术瓶颈、市场竞争加剧、政策调整等因素都可能对行业发展产生重要影响。`,
      platforms: ['toutiao', 'juejin']
    }
  ]

  return {
    category,
    generatedAt: new Date().toISOString(),
    summary: `这是关于${category}领域的AI智能摘要。通过分析海量信息源，我们提取了当前${category}领域的核心内容，包括最新发展动态、市场趋势、技术创新和热点事件等。本摘要旨在帮助用户快速了解${category}领域的整体情况，把握行业脉搏。`,
    hotTopics: mockHotTopics,
    trends: mockTrends,
    sections: mockSections
  }
}

// 加载AI总结数据
const loadAISummary = async () => {
  loading.value = true
  error.value = null

  try {
    // 首先尝试从真实API获取数据
    summaryData.value = await fetchAISummary(props.category)
  } catch (err) {
    console.warn('获取AI总结失败，使用模拟数据:', err)
    // 设置错误信息
    error.value = '当前无法连接到AI服务，显示模拟数据'
    // 使用模拟数据作为后备
    summaryData.value = generateMockData(props.category)
  } finally {
    loading.value = false
  }
}

// 重试加载
const retry = () => {
  summaryData.value = null
  loadAISummary()
}

// 格式化时间
const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return '刚刚生成'
  if (minutes < 60) return `${minutes}分钟前生成`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前生成`
  return date.toLocaleDateString('zh-CN')
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 弹窗标题 -->
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-xl">
          <Sparkles class="w-5 h-5 text-primary"/>
          <span>{{ categoryTitle }} - AI 智能总结</span>
        </DialogTitle>
        <DialogDescription v-if="summaryData" class="text-xs text-muted-foreground mt-2">
          {{ formatTime(summaryData.generatedAt) }}
        </DialogDescription>
      </DialogHeader>

      <!-- 弹窗内容 -->
      <div class="flex-1 overflow-y-auto">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <Loader2 class="w-8 h-8 animate-spin text-primary mb-4"/>
          <p class="text-muted-foreground">正在生成AI总结...</p>
          <p class="text-xs text-muted-foreground mt-2">分析海量数据，提炼精华内容</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
          <AlertCircle class="w-8 h-8 text-destructive mb-4"/>
          <p class="text-muted-foreground mb-4">{{ error }}</p>
          <Button @click="retry" variant="outline" size="sm">
            重新加载
          </Button>
        </div>

        <!-- 内容展示 -->
        <div v-else-if="summaryData" class="space-y-6">
          <!-- 总体概述 -->
          <div class="flex items-center gap-2 mb-4">
            <Hash class="w-4 h-4 text-primary"/>
            <h3 class="font-medium">总体概述</h3>
          </div>
          <Card>
            <CardContent>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ summaryData.summary }}
              </p>
            </CardContent>
          </Card>

          <!-- 热门话题 -->
          <div v-if="summaryData.hotTopics?.length">
            <div class="flex items-center gap-2 mb-4">
              <Hash class="w-4 h-4 text-primary"/>
              <h3 class="font-medium">热门话题</h3>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <Card v-for="(topic, index) in summaryData.hotTopics" :key="index"
                    class="hover:shadow-md transition-shadow">
                <CardHeader class="pb-3">
                  <CardTitle class="text-sm font-medium flex items-start justify-between">
                    <span class="flex-1">{{ topic.topic }}</span>
                    <Badge variant="secondary" class="ml-2 shrink-0">
                      热度 {{ (95 - index * 5) }}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p class="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {{ topic.description }}
                  </p>
                  <div v-if="topic.relatedPlatforms?.length" class="flex flex-wrap gap-1">
                    <Badge
                        v-for="platform in topic.relatedPlatforms"
                        :key="platform"
                        variant="outline"
                        class="text-xs"
                    >
                      {{ getTitle(platform) }}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <!-- 趋势分析 -->
          <div v-if="summaryData.trends?.length">
            <div class="flex items-center gap-2 mb-4">
              <TrendingUp class="w-4 h-4 text-primary"/>
              <h3 class="font-medium">趋势分析</h3>
            </div>
            <div class="space-y-3">
              <div v-for="(trend, index) in summaryData.trends" :key="index" class="flex gap-3">
                <div class="w-1 bg-primary rounded-full shrink-0"/>
                <div class="flex-1">
                  <h4 class="font-medium text-sm mb-1">{{ trend.title }}</h4>
                  <p class="text-xs text-muted-foreground leading-relaxed">
                    {{ trend.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 分类板块 -->
          <div v-if="summaryData.sections?.length" class="space-y-4">
            <Separator/>
            <div v-for="(section, index) in summaryData.sections" :key="index">
              <h3 class="font-medium mb-3">{{ section.title }}</h3>
              <p class="text-sm text-muted-foreground mb-3 leading-relaxed">
                {{ section.content }}
              </p>
              <div v-if="section.platforms?.length" class="flex flex-wrap gap-2">
                <Badge
                    v-for="platform in section.platforms"
                    :key="platform"
                    variant="secondary"
                    class="text-xs"
                >
                  {{ getTitle(platform) }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底部 -->
      <DialogFooter class="mt-6">
        <div class="flex items-center justify-between w-full">
          <p class="text-xs text-muted-foreground">
            <Sparkles class="w-3 h-3 inline mr-1"/>
            由 AI 智能分析生成
          </p>
          <Button @click="open = false" variant="outline">
            关闭
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

</style>
