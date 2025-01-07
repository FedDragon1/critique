<script setup lang="ts">
defineProps<{
    fill: string,
    height: string,
    width: string
}>();
</script>

<template>
    <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.01333 1.93999C5.80666 1.93999 4.01333 3.73332 4.01333 5.93999V7.86665C4.01333 8.27332 3.84 8.89332 3.63333 9.23999L2.86666 10.5133C2.39333 11.3 2.72 12.1733 3.58666 12.4667C6.46 13.4267 9.56 13.4267 12.4333 12.4667C13.24 12.2 13.5933 11.2467 13.1533 10.5133L12.3867 9.23999C12.1867 8.89332 12.0133 8.27332 12.0133 7.86665V5.93999C12.0133 3.73999 10.2133 1.93999 8.01333 1.93999Z" :stroke="fill" stroke-width="1" stroke-miterlimit="10" stroke-linecap="round"/>
        <path d="M9.24682 2.1334C9.04015 2.0734 8.82682 2.02673 8.60682 2.00006C7.96682 1.92006 7.35348 1.96673 6.78015 2.1334C6.97348 1.64006 7.45348 1.2934 8.01348 1.2934C8.57348 1.2934 9.05348 1.64006 9.24682 2.1334Z" :stroke="fill" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10.0135 12.7066C10.0135 13.8066 9.11355 14.7066 8.01355 14.7066C7.46688 14.7066 6.96022 14.4799 6.60022 14.1199C6.24022 13.7599 6.01355 13.2533 6.01355 12.7066" :stroke="fill" stroke-width="1.5" stroke-miterlimit="10"/>
    </svg>
</template>

<style scoped>

</style>