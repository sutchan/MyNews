<script setup lang="ts">
// 重导出SidebarProvider组件，解决导入路径不一致问题
import SidebarProvider from './SidebarProvider.vue'

defineOptions({
  name: 'UiSidebarProvider'
})
</script>

<template>
  <SidebarProvider v-bind="$attrs">
    <slot />
  </SidebarProvider>
</template>