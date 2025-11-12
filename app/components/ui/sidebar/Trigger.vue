<script setup lang="ts">
// 重导出SidebarTrigger组件，解决导入路径不一致问题
import SidebarTrigger from './SidebarTrigger.vue'

defineOptions({
  name: 'UiSidebarTrigger'
})
</script>

<template>
  <SidebarTrigger v-bind="$attrs">
    <slot />
  </SidebarTrigger>
</template>