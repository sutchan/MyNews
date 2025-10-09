<script setup lang="ts">
import type {SidebarProps} from '@/components/ui/sidebar'
import {computed, ref} from 'vue'

import {
  Home,
  TrendingUp,
  Cpu,
  DollarSign,
  Globe,
  Music,
  Trophy,
  Car,
  Clock,
  Heart,
  Bookmark,
  Star,
  User,
  LogOut
} from 'lucide-vue-next'

import {useFavorites} from '@/composables/useFavorites'
import {useAuth} from '@/composables/useAuth'
import {NAVIGATION_ITEMS, ROUTE_CONFIGS} from '@/config/platforms'

import LoginDialog from '@/components/LoginDialog.vue'

import TeamSwitcher from "@/components/TeamSwitcher.vue";
import NavMain from "@/components/NavMain.vue";
import logoPng from '@/assets/512.png'

interface AppSidebarProps extends SidebarProps {
  // 使用新的路由结构，不需要额外props
}

const props = withDefaults(defineProps<AppSidebarProps>(), {
  collapsible: 'icon'
})

// 收藏功能
const {newsItemsCount, platformsCount} = useFavorites()

// 认证功能
const {authState, logout} = useAuth()

// 登录对话框状态
const isLoginDialogOpen = ref(false)

// 处理登出
const handleLogout = () => {
  logout()
}

// 打开登录对话框
const openLoginDialog = () => {
  isLoginDialogOpen.value = true
}

// 获取当前用户信息
const currentUser = computed(() => {
  return authState.value.userInfo || null
})


// 获取路径对应的平台数量
const getPlatformCount = (path: string): number => {
  const routeKey = path === '/' ? 'index' : path.replace('/', '')
  const routeConfig = ROUTE_CONFIGS[routeKey]
  return routeConfig?.platforms?.length || 0
}

// 图标映射
const iconMap = {
  'Home': Home,
  'TrendingUp': TrendingUp,
  'Cpu': Cpu,
  'DollarSign': DollarSign,
  'Globe': Globe,
  'Music': Music,
  'Trophy': Trophy,
  'Car': Car,
  'Clock': Clock,
  'Heart': Heart,
  'Bookmark': Bookmark,
  'Star': Star
}

const data = computed(() => ({
  teams: [
    {
      name: '今 日 时 事',
      logo: logoPng,
    }
  ],
  navMain: NAVIGATION_ITEMS.map(item => {
    const baseItem = {
      title: item.title,
      url: item.path,
      icon: iconMap[item.icon as keyof typeof iconMap] || Home,
      isActive: false,
      items: []
    }

    // 为收藏相关项目添加徽章 - SSR 兼容版本
    if (item.path === '/favorites-news') {
      return {
        ...baseItem,
        badge: computed(() => {
          // 在服务端渲染时始终返回 undefined 以避免 hydration 不匹配
          if (process.server) return undefined
          return newsItemsCount.value > 0 ? newsItemsCount.value.toString() : undefined
        })
      }
    }

    if (item.path === '/favorites-platforms') {
      return {
        ...baseItem,
        badge: computed(() => {
          // 在服务端渲染时始终返回 undefined 以避免 hydration 不匹配
          if (process.server) return undefined
          return platformsCount.value > 0 ? platformsCount.value.toString() : undefined
        })
      }
    }

    // 为除了首页和收藏页面外的其他类目添加平台数量徽章
    if (item.path !== '/' && !item.path.startsWith('/favorites')) {
      const platformCount = getPlatformCount(item.path)
      return {
        ...baseItem,
        badge: computed(() => platformCount > 0 ? platformCount.toString() : undefined)
      }
    }

    return baseItem
  })
}))
</script>

<template>
  <UiSidebar v-bind="props">
    <UiSidebarHeader>
      <TeamSwitcher :teams="data.teams"/>
    </UiSidebarHeader>
    
    <!-- 用户信息/登录区域 -->
    <div class="px-4 py-3 border-b">
      <div v-if="currentUser" class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User class="w-4 h-4" />
          </div>
          <div>
            <div class="text-sm font-medium">{{ currentUser.nickname }}</div>
            <div class="text-xs text-muted-foreground truncate max-w-[120px]">{{ currentUser.loginType }}</div>
          </div>
        </div>
        <button 
          @click="handleLogout"
          class="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="退出登录"
        >
          <LogOut class="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div v-else class="py-2">
        <button 
          @click="openLoginDialog"
          class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <User class="w-4 h-4" />
          <span>登录</span>
        </button>
      </div>
    </div>
    
    <UiSidebarContent>
      <NavMain :items="data.navMain"/>
    </UiSidebarContent>
    <UiSidebarRail/>
    
    <!-- 登录对话框 -->
    <LoginDialog 
      :open="isLoginDialogOpen" 
      @open-change="(open) => isLoginDialogOpen = open" 
    >
      <template #trigger></template>
    </LoginDialog>
  </UiSidebar>
</template>
