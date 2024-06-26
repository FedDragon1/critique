<script setup lang="ts">
const user = useSupabaseUser();
const router = useRouter();

setTimeout(() => {
  router.push('/dashboard');
}, 1000)
</script>

<template>
  You are signed in!
  Redirecting...
{{user}}
</template>

<style scoped>

</style>