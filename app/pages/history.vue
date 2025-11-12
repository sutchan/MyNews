<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Calendar, Search, Trash2, Filter, X, Clock, History, ChevronDown, ChevronUp, ExternalLink } from 'lucide-vue-next'
import { useHistory } from '../composables/useHistory'
import { useRouter } from 'nuxt/app'
import { useGlobalToast } from '../composables/useToast'
import { formatNumber } from '../lib/utils'
import type { HistoryItem } from '../composables/useHistory'

// 导入UI组件
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Skeleton } from '~/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'

// 使用阅读历史组合式函数
const { 
  history, 
  historyCount, 
  removeFromHistory, 
  clearHistory, 
  searchHistory,
  getHistoryByDate 
} = useHistory()

const router = useRouter()
const toastService = useGlobalToast()

// 搜索关键词
const searchQuery = ref('')
// 加载状态
const isLoading = ref(false)
// 展开的日期组
const expandedDateGroups = ref<string[]>([])
// 选择的排序方式
const sortBy = ref<'newest' | 'oldest' | 'platform'>('newest')
// 批量删除模式
const batchDeleteMode = ref(false)
// 选中的项目
const selectedItems = ref<string[]>([])

// 按日期分组的历史记录
const groupedHistory = computed(() => {
  // 先进行搜索过滤
  let filteredHistory = history.value
  if (searchQuery.value.trim()) {
    filteredHistory = searchHistory(searchQuery.value.trim())
  }
  
  // 然后按日期分组
  const grouped = getHistoryByDate()
  const result = Object.entries(grouped)
    .map(([date, items]) => {
      // 根据排序方式对每日的项目进行排序
      const sortedItems = [...items].sort((a, b) => {
        if (sortBy.value === 'newest') {
          return b.readAt - a.readAt
        } else if (sortBy.value === 'oldest') {
          return a.readAt - b.readAt
        } else { // platform
          return a.platformTitle.localeCompare(b.platformTitle)
        }
      })
      
      return {
        date,
        formattedDate: formatDate(date),
        items: sortedItems,
        count: sortedItems.length
      }
    })
    .sort((a, b) => {
      // 按日期排序，最新的在前
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  
  return result
})

// 格式化日期显示
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 格式化相对时间
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) { // 小于1分钟
    return '刚刚'
  } else if (diff < 3600000) { // 小于1小时
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 小于1天
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return `${Math.floor(diff / 86400000)}天前`
  }
}

// 处理新闻项点击
function handleNewsClick(item: HistoryItem) {
  if (batchDeleteMode.value) {
    toggleItemSelection(item.id)
  } else {
    // 打开新闻链接
    window.open(item.url, '_blank')
  }
}

// 切换日期组的展开/折叠状态
function toggleDateGroup(date: string) {
  const index = expandedDateGroups.value.indexOf(date)
  if (index >= 0) {
    expandedDateGroups.value.splice(index, 1)
  } else {
    expandedDateGroups.value.push(date)
  }
}

// 切换全部日期组的展开/折叠状态
function toggleAllDateGroups() {
  const allDates = groupedHistory.value.map(group => group.date)
  if (expandedDateGroups.value.length === allDates.length) {
    expandedDateGroups.value = []
  } else {
    expandedDateGroups.value = [...allDates]
  }
}

// 移除单个历史记录
function handleRemoveItem(itemId: string, event?: Event) {
  if (event) {
    event.stopPropagation()
  }
  
  removeFromHistory(itemId)
  toastService.add({
    type: 'success',
    message: '已移除阅读记录'
  })
}

// 清空所有历史记录
async function handleClearAll() {
  try {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟异步操作
    clearHistory()
    selectedItems.value = []
    batchDeleteMode.value = false
    toastService.add({
      type: 'success',
      message: '已清空所有阅读记录'
    })
  } catch (error) {
    console.error('清空历史记录失败:', error)
    toastService.add({
      type: 'error',
      message: '清空失败，请重试'
    })
  } finally {
    isLoading.value = false
  }
}

// 切换批量删除模式
function toggleBatchDeleteMode() {
  batchDeleteMode.value = !batchDeleteMode.value
  if (!batchDeleteMode.value) {
    selectedItems.value = []
  }
}

// 切换项目选择状态
function toggleItemSelection(itemId: string) {
  const index = selectedItems.value.indexOf(itemId)
  if (index >= 0) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
}

// 全选/取消全选当前页面的项目
function toggleSelectAll() {
  const allItemIds = groupedHistory.value.flatMap(group => 
    group.items.map(item => item.id)
  )
  
  if (selectedItems.value.length === allItemIds.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = [...allItemIds]
  }
}

// 批量删除选中的项目
function deleteSelectedItems() {
  selectedItems.value.forEach(itemId => {
    removeFromHistory(itemId)
  })
  
  toastService.add({
    type: 'success',
    message: `已删除 ${selectedItems.value.length} 条阅读记录`
  })
  
  selectedItems.value = []
  
  // 如果没有更多项目，退出批量删除模式
  if (historyCount.value === 0) {
    batchDeleteMode.value = false
  }
}

// 初始化时展开今天的记录
onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  expandedDateGroups.value = [today]
})

// 监听搜索查询变化，重置选中状态
watch(searchQuery, () => {
  selectedItems.value = []
})
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 页面头部 -->
    <header class="flex-shrink-0 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="flex flex-col space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <History class="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 class="text-xl font-semibold">阅读历史</h1>
            <Badge variant="secondary" class="ml-2">
              {{ historyCount }}
            </Badge>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- 批量删除模式按钮 -->
            <Button 
              variant="ghost" 
              size="sm"
              @click="toggleBatchDeleteMode"
              :class="batchDeleteMode && 'bg-destructive/10 text-destructive'"
            >
              {{ batchDeleteMode ? '取消' : '批量选择' }}
            </Button>
            
            <!-- 在批量删除模式下显示删除按钮 -->
            <Button 
              variant="destructive" 
              size="sm"
              @click="deleteSelectedItems"
              :disabled="selectedItems.length === 0"
              v-if="batchDeleteMode"
            >
              <Trash2 class="h-4 w-4 mr-1" />
              删除({{ selectedItems.length }})
            </Button>
            
            <!-- 清空历史记录对话框 -->
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" class="text-muted-foreground">
                  <Trash2 class="h-4 w-4 mr-1" />
                  清空历史
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>确认清空</DialogTitle>
                </DialogHeader>
                <p class="py-4 text-muted-foreground">确定要清空所有阅读历史记录吗？此操作无法撤销。</p>
                <div class="flex justify-end gap-2">
                  <Button variant="ghost">取消</Button>
                  <Button variant="destructive" @click="handleClearAll" :disabled="isLoading">
                    {{ isLoading ? '清空ing...' : '确认清空' }}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <!-- 搜索和筛选区域 -->
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              v-model="searchQuery"
              placeholder="搜索阅读历史..."
              class="pl-10 h-9"
              type="search"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              class="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              @click="searchQuery = ''"
              v-if="searchQuery"
            >
              <X class="h-3 w-3" />
            </Button>
          </div>
          
          <div class="flex gap-2">
            <!-- 排序选择 -->
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" class="h-9 gap-1">
                  <Clock class="h-4 w-4" />
                  <span>{{ sortBy === 'newest' ? '最新' : sortBy === 'oldest' ? '最早' : '平台' }}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="sortBy = 'newest'">
                  最新优先
                </DropdownMenuItem>
                <DropdownMenuItem @click="sortBy = 'oldest'">
                  最早优先
                </DropdownMenuItem>
                <DropdownMenuItem @click="sortBy = 'platform'">
                  按平台排序
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <!-- 展开/折叠全部 -->
            <Button 
              variant="ghost" 
              size="sm" 
              class="h-9"
              @click="toggleAllDateGroups"
            >
              {{ expandedDateGroups.length === groupedHistory.length ? '全部折叠' : '全部展开' }}
            </Button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="flex-1 overflow-hidden">
      <ScrollArea class="h-full">
        <div class="p-4 space-y-4">
          <!-- 加载状态 -->
          <div v-if="isLoading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="space-y-2">
              <Skeleton class="h-6 w-32" />
              <div class="space-y-1">
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-2/3" />
              </div>
            </div>
          </div>
          
          <!-- 无历史记录状态 -->
          <div v-else-if="historyCount === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <Calendar class="h-16 w-16 text-muted-foreground mb-4" />
            <h3 class="text-lg font-medium mb-2">暂无阅读历史</h3>
            <p class="text-muted-foreground max-w-sm">阅读新闻后，历史记录会显示在这里</p>
            <Button class="mt-4" @click="router.push('/')">
              浏览新闻
            </Button>
          </div>
          
          <!-- 搜索无结果状态 -->
          <div v-else-if="groupedHistory.length === 0 && searchQuery" class="flex flex-col items-center justify-center py-16 text-center">
            <Search class="h-16 w-16 text-muted-foreground mb-4" />
            <h3 class="text-lg font-medium mb-2">没有找到相关记录</h3>
            <p class="text-muted-foreground max-w-sm">尝试使用不同的关键词搜索</p>
            <Button variant="ghost" class="mt-4" @click="searchQuery = ''">
              清除搜索
            </Button>
          </div>
          
          <!-- 历史记录列表 -->
          <div v-else class="space-y-4">
            <!-- 全选/取消全选按钮 - 仅在批量删除模式下显示 -->
            <div v-if="batchDeleteMode" class="flex justify-between items-center px-4 py-2 border rounded-md">
              <Button 
                variant="ghost" 
                size="sm" 
                @click="toggleSelectAll"
                :class="selectedItems.length === groupedHistory.flatMap(g => g.items).length ? 'bg-primary/10 text-primary' : ''"
              >
                {{ selectedItems.length === groupedHistory.flatMap(g => g.items).length ? '取消全选' : '全选' }}
              </Button>
              <span class="text-sm text-muted-foreground">
                已选择 {{ selectedItems.length }} / {{ groupedHistory.flatMap(g => g.items).length }}
              </span>
            </div>
            
            <!-- 按日期分组显示历史记录 -->
            <div v-for="group in groupedHistory" :key="group.date" class="space-y-2">
              <!-- 日期分组头部 -->
              <div 
                class="flex items-center justify-between px-3 py-2 bg-muted rounded-md cursor-pointer"
                @click="toggleDateGroup(group.date)"
              >
                <div class="flex items-center gap-2">
                  <Calendar class="h-4 w-4 text-muted-foreground" />
                  <span class="font-medium">{{ group.formattedDate }}</span>
                  <Badge variant="outline" class="ml-2">
                    {{ group.count }} 条
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="h-7 w-7"
                >
                  <ChevronDown 
                    v-if="expandedDateGroups.includes(group.date)"
                    class="h-4 w-4 rotate-180 transition-transform"
                  />
                  <ChevronDown 
                    v-else
                    class="h-4 w-4 transition-transform"
                  />
                </Button>
              </div>
              
              <!-- 日期分组内容 -->
              <div 
                v-if="expandedDateGroups.includes(group.date)"
                class="pl-4 border-l border-muted/50 space-y-1"
              >
                <div 
                  v-for="item in group.items" 
                  :key="item.id"
                  class="flex items-start gap-2 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group"
                  :class="batchDeleteMode && selectedItems.includes(item.id) ? 'bg-destructive/10' : ''"
                  @click="handleNewsClick(item)"
                >
                  <!-- 选择框 - 仅在批量删除模式下显示 -->
                  <div v-if="batchDeleteMode" class="flex-shrink-0 mt-1">
                    <div 
                      class="w-4 h-4 rounded border flex items-center justify-center"
                      :class="selectedItems.includes(item.id) ? 'border-destructive bg-destructive text-white' : 'border-muted-foreground/50'"
                    >
                      <div v-if="selectedItems.includes(item.id)" class="w-2 h-2 bg-current rounded-sm"></div>
                    </div>
                  </div>
                  
                  <!-- 主要内容区域 -->
                  <div class="flex-1 min-w-0">
                    <!-- 标题 -->
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p class="text-sm text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal line-clamp-2 relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50">
                            {{ item.title }}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p class="max-w-sm">{{ item.title }}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <!-- 平台和时间信息 -->
                    <div class="flex items-center justify-between gap-2 mt-1 text-xs text-muted-foreground">
                      <div class="flex items-center gap-2">
                        <span>{{ item.platformTitle }}</span>
                        <span class="text-muted-foreground/50">·</span>
                        <span>{{ formatRelativeTime(item.readAt) }}</span>
                        <span v-if="item.readCount > 1" class="text-muted-foreground/70">
                          (已阅读 {{ item.readCount }} 次)
                        </span>
                      </div>
                      
                      <!-- 操作按钮 -->
                      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          class="h-6 w-6"
                          @click.stop="window.open(item.url, '_blank')"
                        >
                          <ExternalLink class="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          class="h-6 w-6 hover:text-destructive"
                          @click.stop="handleRemoveItem(item.id)"
                        >
                          <Trash2 class="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </main>
  </div>
</template>
