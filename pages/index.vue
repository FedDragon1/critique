<script setup lang="ts">
let user = useSupabaseUser();

definePageMeta({
  middleware: 'login-redirect'
})
</script>

<template>
homepage
  <NuxtLink to="/login">Login</NuxtLink>

  {{user ?? "no user"}}

</template>

<style scoped>

</style>