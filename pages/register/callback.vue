<script setup lang="ts">
const user = useSupabaseUser()

console.log(user)
</script>

<template>
  <SeoHead title="Verify your email" />
  <CardFrame>
    <template #title>
      You are signed up!
    </template>
<!--    TODO: register a domain and set up stmp... Currently impossible to verify-->
    {{user}}
  </CardFrame>
</template>

<style scoped>

</style>