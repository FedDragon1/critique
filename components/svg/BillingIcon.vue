<script setup lang="ts">
defineProps<{
    width?: string,
    height?: string,
    fill?: string
}>()
</script>

<template>
    <svg :width="width ?? 18" :height="height ?? 18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.0462 14.775C5.6612 14.115 6.59871 14.1675 7.13871 14.8875L7.89621 15.9C8.50371 16.7025 9.48621 16.7025 10.0937 15.9L10.8512 14.8875C11.3912 14.1675 12.3287 14.115 12.9437 14.775C14.2787 16.2 15.3662 15.7275 15.3662 13.7325V5.28C15.3662 2.2575 14.6612 1.5 11.8262 1.5H6.15621C3.32121 1.5 2.61621 2.2575 2.61621 5.28V13.725C2.62371 15.7275 3.7187 16.1925 5.0462 14.775Z" :stroke="fill ?? '#292D32'" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.9375 7.5H11.0625" :stroke="fill ?? '#292D32'" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<style scoped>

</style>