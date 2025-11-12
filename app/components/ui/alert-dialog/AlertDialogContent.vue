<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import {
  AlertDialogContent as RekaAlertDialogContent,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "reka-ui"
import { cn } from "@/lib/utils"

// 直接定义需要的props，避免类型继承问题
const props = defineProps<{
  class?: HTMLAttributes["class"]
  description?: string
  // 添加DialogContent需要的其他基本属性
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>()
</script>

<template>
  <AlertDialogPortal>
    <AlertDialogOverlay
      data-slot="alert-dialog-overlay"
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
    />
    <RekaAlertDialogContent
      data-slot="alert-dialog-content"
      :open="props.open"
      :on-open-change="props.onOpenChange"
      :description="props.description"
      :class="
        cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          props.class
        )
      "
    >
      <slot />
    </RekaAlertDialogContent>
  </AlertDialogPortal>
</template>
