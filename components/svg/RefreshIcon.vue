<script setup lang="ts">
defineProps<{
    fill: string,
    height: string,
    width: string
}>();
</script>

<template>
    <svg :width="width" :height="height" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.06538 2.75167C7.59413 2.61084 7.07413 2.51875 6.49996 2.51875C3.90538 2.51875 1.80371 4.62042 1.80371 7.215C1.80371 9.815 3.90538 11.9167 6.49996 11.9167C9.09454 11.9167 11.1962 9.815 11.1962 7.22042C11.1962 6.25625 10.9037 5.35709 10.4054 4.60959" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8.73705 2.88167L7.17163 1.08334" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8.73704 2.88167L6.91162 4.21417" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<style scoped>

</style>