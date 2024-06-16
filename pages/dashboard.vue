<script setup lang="ts">

definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser();
</script>

<template>
{{user}}
</template>

<style scoped>

</style>