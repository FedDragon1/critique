<script setup lang="ts">
const user = useSupabaseUser();
const router = useRouter();

setTimeout(() => {
  router.push('/dashboard');
}, 1000)
</script>

<template>
  <SeoHead title="Logging in..." />
  <CardFrame>
    <template #title>
      You are signed in!
    </template>
    Redirecting you to the dashboard...
  </CardFrame>
</template>

<style scoped>

</style>