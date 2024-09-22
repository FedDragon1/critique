<script setup lang="ts">
defineProps<{
  color?: string
}>()

const attrs = useAttrs();
</script>

<template>
  <svg v-bind="attrs" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Edit / Heading_H1">
      <path id="Vector" d="M16 10L19 9L19 19M3 5V12M3 12V19M3 12H11M11 5V12M11 12V19"
            :stroke="color ?? 'var(--el-text-color-secondary)'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>
</template>

<style scoped>

</style>