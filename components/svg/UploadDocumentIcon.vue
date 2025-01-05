<script setup lang="ts">
defineProps<{
    fill: string,
    height: string,
    width: string
}>();
</script>

<template>
    <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.0834 7.58333V10.25C11.0834 11.1928 11.0834 11.6642 10.7905 11.9571C10.4976 12.25 10.0262 12.25 9.08342 12.25H4.91675C3.97394 12.25 3.50253 12.25 3.20964 11.9571C2.91675 11.6642 2.91675 11.1928 2.91675 10.25V3.75C2.91675 2.80719 2.91675 2.33579 3.20964 2.04289C3.50253 1.75 3.97394 1.75 4.91675 1.75H7.00008" :stroke="fill" stroke-width="1.0" stroke-linecap="round"/>
        <path d="M10.5 1.75L10.5 5.25" :stroke="fill" stroke-width="1.0" stroke-linecap="round"/>
        <path d="M12.25 3.5L8.75 3.5" :stroke="fill" stroke-width="1.0" stroke-linecap="round"/>
        <path d="M5.25 7.58333L8.75 7.58333" :stroke="fill" stroke-width="1.0" stroke-linecap="round"/>
        <path d="M5.25 5.25L7.58333 5.25" :stroke="fill" stroke-width="1.0" stroke-linecap="round"/>
        <path d="M5.25 9.91667L7.58333 9.91667" :stroke="fill" stroke-width="1.0" stroke-linecap="round"/>
    </svg>
</template>

<style scoped>

</style>