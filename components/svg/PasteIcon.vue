<script setup lang="ts">
defineProps<{
    fill: string,
    height: string,
    width: string
}>();
</script>

<template>
    <svg :width="width" :height="height" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.8334 4.46874V9.74999C10.8334 11.375 9.86383 11.9167 8.66675 11.9167H4.33341C3.13633 11.9167 2.16675 11.375 2.16675 9.74999V4.46874C2.16675 2.70833 3.13633 2.30208 4.33341 2.30208C4.33341 2.63791 4.46882 2.94124 4.6909 3.16333C4.91298 3.38541 5.21633 3.52083 5.55216 3.52083H7.448C8.11966 3.52083 8.66675 2.97374 8.66675 2.30208C9.86383 2.30208 10.8334 2.70833 10.8334 4.46874Z" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8.66659 2.30208C8.66659 2.97374 8.1195 3.52083 7.44784 3.52083H5.552C5.21617 3.52083 4.91282 3.38541 4.69074 3.16333C4.46865 2.94124 4.33325 2.63791 4.33325 2.30208C4.33325 1.63041 4.88034 1.08333 5.552 1.08333H7.44784C7.78367 1.08333 8.08702 1.21875 8.3091 1.44083C8.53118 1.66291 8.66659 1.96624 8.66659 2.30208Z" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.33325 7.04166H6.49992" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.33325 9.20834H8.66659" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<style scoped>

</style>