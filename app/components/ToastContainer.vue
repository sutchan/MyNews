<script setup lang="ts">
import { useGlobalToast } from '../composables/useToast'
import { defineProps } from 'vue'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-vue-next'

// 图标映射
const iconMap = {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
}

// 通知容器组件属性
const props = defineProps<{
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}>()

// 默认位置
const defaultPosition = 'top-right'

// 使用全局通知服务
const {
  toasts,
  removeToast,
  getToastClass,
  getToastIcon
} = useGlobalToast()

// 获取位置类
const getPositionClass = () => {
  const position = props.position || defaultPosition
  
  switch (position) {
    case 'top-right':
      return 'top-4 right-4'
    case 'top-left':
      return 'top-4 left-4'
    case 'bottom-right':
      return 'bottom-4 right-4'
    case 'bottom-left':
      return 'bottom-4 left-4'
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2'
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2'
    default:
      return 'top-4 right-4'
  }
}
</script>

<template>
  <div 
    class="fixed z-50 flex flex-col gap-2 w-80 sm:w-96"
    :class="getPositionClass()"
  >
    <transition-group 
      name="toast"
      tag="div"
      class="flex flex-col gap-2"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-start gap-3 p-4 border rounded-md shadow-lg backdrop-blur-sm bg-background/90"
        :class="getToastClass(toast.type)"
      >
        <!-- 通知图标 -->
        <div class="flex-shrink-0 mt-0.5">
          <component 
            :is="iconMap[getToastIcon(toast.type) as keyof typeof iconMap] || Info"
            class="h-5 w-5"
          />
        </div>
        
        <!-- 通知消息 -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-relaxed">
            {{ toast.message }}
          </p>
        </div>
        
        <!-- 关闭按钮 -->
        <button
          type="button"
          class="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
          @click="removeToast(toast.id)"
          aria-label="关闭通知"
        >
          <X class="h-3 w-3" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
/* 通知动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-enter-active {
  animation: toastIn 0.3s ease;
}

.toast-leave-active {
  animation: toastOut 0.3s ease;
}

/* 根据位置调整入场动画方向 */
:deep(.toast-enter-from.top-left),
:deep(.toast-enter-from.top-center),
:deep(.toast-enter-from.bottom-left),
:deep(.toast-enter-from.bottom-center) {
  transform: translateX(-100%);
}

:deep(.toast-enter-from.top-center),
:deep(.toast-enter-from.bottom-center) {
  transform: translateY(-50%);
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* 堆叠效果 */
:deep(.toast-enter-to:nth-child(n+2)) {
  animation-delay: 0.1s;
}

:deep(.toast-enter-to:nth-child(n+3)) {
  animation-delay: 0.2s;
}
</style>
