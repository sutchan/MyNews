<script setup lang="ts">
import { AlertDialogRoot as RekaAlertDialogRoot } from "reka-ui"

// 直接定义需要的props，避免类型继承问题
const props = defineProps<{
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  class?: string
}>()
</script>

<template>
  <RekaAlertDialogRoot 
    data-slot="alert-dialog" 
    :open="props.open"
    :on-open-change="props.onOpenChange"
    :modal="props.modal !== false"
    :class="props.class"
  >
    <slot />
  </RekaAlertDialogRoot>
</template>
