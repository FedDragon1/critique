<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
<Head>
  <Title>Critique | {{ title }}</Title>
  <slot/>
</Head>
</template>

<style scoped>

</style>