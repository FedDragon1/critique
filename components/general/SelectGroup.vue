<script setup lang="ts">
defineProps<{
    name: string
}>()
</script>

<template>
    <div>
        <span class="ml-4 text-xs py-2 block text-zinc-500">View</span>
        <slot />
    </div>
</template>

<style scoped>

</style>