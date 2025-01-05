<script setup lang="ts">
defineProps<{
    name: string
}>()
</script>

<template>
    <div>
        <span class="ml-4 text-[0.6rem] py-2 block text-zinc-500">{{ name }}</span>
        <slot />
    </div>
</template>

<style scoped>

</style>