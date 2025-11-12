<script setup lang="ts">
// 重导出SidebarInset组件，解决导入路径不一致问题
import SidebarInset from './SidebarInset.vue'

defineOptions({
  name: 'UiSidebarInset'
})
</script>

<template>
  <SidebarInset v-bind="$attrs">
    <slot />
  </SidebarInset>
</template>