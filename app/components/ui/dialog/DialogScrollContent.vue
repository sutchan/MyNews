<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { X } from "lucide-vue-next"
import {
  DialogClose,
  DialogContent as RekaDialogContent,
  DialogOverlay,
  DialogPortal,
} from "reka-ui"
import { cn } from "@/lib/utils"

// 直接定义所需的props，避免类型继承问题
const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    >
      <RekaDialogContent
        :class="
          cn(
            'relative z-50 grid w-full max-w-lg my-8 gap-4 border border-border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full',
            props.class,
          )
        "
        v-bind="{ ...$attrs }"
        @pointer-down-outside="(event) => {
          const originalEvent = event.detail.originalEvent;
          const target = originalEvent.target as HTMLElement;
          if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) {
            event.preventDefault();
          }
        }"
      >
        <slot />

        <DialogClose
          class="absolute top-4 right-4 p-0.5 transition-colors rounded-md hover:bg-secondary"
        >
          <X class="w-4 h-4" />
          <span class="sr-only">Close</span>
        </DialogClose>
      </RekaDialogContent>
    </DialogOverlay>
  </DialogPortal>
</template>
