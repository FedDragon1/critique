<script setup lang="ts">
defineProps<{
    fill: string,
    height: string,
    width: string
}>();
</script>

<template>
    <svg :width="width" :height="height" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.70044 4.80999H9.54419" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.45581 4.80999L3.86206 5.21624L5.08081 3.99749" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.70044 8.6017H9.54419" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.45581 8.6017L3.86206 9.00795L5.08081 7.7892" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.87492 11.9166H8.12492C10.8333 11.9166 11.9166 10.8333 11.9166 8.12496V4.87496C11.9166 2.16663 10.8333 1.0833 8.12492 1.0833H4.87492C2.16659 1.0833 1.08325 2.16663 1.08325 4.87496V8.12496C1.08325 10.8333 2.16659 11.9166 4.87492 11.9166Z" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<style scoped>

</style>