<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { TooltipArrow, TooltipContent as RekaTooltipContent, TooltipPortal } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

// 直接定义所需的props，避免类型继承问题
const props = withDefaults(defineProps<{
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  alignOffset?: number
  class?: HTMLAttributes['class']
}>(), {
  side: 'top',
  align: 'center',
  sideOffset: 4,
  alignOffset: 0,
})
</script>

<template>
  <TooltipPortal>
    <RekaTooltipContent
      data-slot="tooltip-content"
      v-bind="{ 
        side: props.side, 
        align: props.align, 
        sideOffset: props.sideOffset, 
        alignOffset: props.alignOffset,
        ...$attrs 
      }"
      :class="cn('bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance', props.class)"
    >
      <slot />

      <TooltipArrow class="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
    </RekaTooltipContent>
  </TooltipPortal>
</template>
