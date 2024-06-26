<script setup lang="ts">
let user = useSupabaseUser();

</script>

<template>
homepage
  <NuxtLink to="/login">Login</NuxtLink>

  {{user ?? "no user"}}

</template>

<style scoped>

</style>