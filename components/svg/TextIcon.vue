<script setup lang="ts">
defineProps<{
  color?: string
}>()

const attrs = useAttrs();
</script>

<template>
  <svg v-bind="attrs" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3V21M9 21H15M19 6V3H5V6"
          :stroke="color ?? 'var(--el-text-color-secondary)'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<style scoped>

</style>