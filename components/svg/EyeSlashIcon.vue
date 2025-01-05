<script setup lang="ts">
defineProps<{
    fill: string,
    height: string,
    width: string
}>();
</script>

<template>
    <svg :width="width" :height="height" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.87037 5.12958L5.12954 7.87041C4.77746 7.51833 4.56079 7.03624 4.56079 6.49999C4.56079 5.42749 5.42746 4.56083 6.49996 4.56083C7.03621 4.56083 7.51829 4.77749 7.87037 5.12958Z" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.65266 3.1254C8.70474 2.4104 7.62141 2.0204 6.50016 2.0204C4.58808 2.0204 2.80599 3.14707 1.56558 5.09707C1.07808 5.86082 1.07808 7.14457 1.56558 7.90832C1.99349 8.57999 2.49183 9.15957 3.03349 9.62541" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.56079 10.5787C5.17829 10.8387 5.83371 10.9796 6.49996 10.9796C8.41204 10.9796 10.1941 9.85291 11.4345 7.90291C11.922 7.13916 11.922 5.85541 11.4345 5.09166C11.2558 4.81 11.0608 4.54458 10.8604 4.29541" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8.40128 6.87917C8.26045 7.64292 7.63753 8.26584 6.87378 8.40667" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5.1295 7.87043L1.08325 11.9167" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11.9166 1.08333L7.87036 5.12958" :stroke="fill" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<style scoped>

</style>