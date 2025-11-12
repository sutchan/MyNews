<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { AccordionItem as RekaAccordionItem } from "reka-ui"

// 直接定义所需的props，避免类型继承问题
const props = defineProps<{
  value: string
  disabled?: boolean
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <RekaAccordionItem
    data-slot="accordion-item"
    v-bind="{ value: props.value, disabled: props.disabled }"
    :class="cn('border-b last:border-b-0', props.class)"
  >
    <slot />
  </RekaAccordionItem>
</template>
