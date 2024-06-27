<script setup lang="ts">
let user = useSupabaseUser();

definePageMeta({
  middleware: 'login-redirect'
})

useSeoMeta({
  title: "Critique | The AI Critical Read Helper",
  ogTitle: "Critique | The AI Critical Read Helper",
  description: "Critique is the next generation rich text editor powered by AI. Scan, upload, and critically read " +
      "with AI summary, tone and sentiment analysis, argument and structure analysis, key question generation in an " +
      "interactive and productive manner.",
  ogDescription: "The next generation rich text editor powered by AI. Scan, upload, and critically read with AI " +
      "summary, tone and sentiment analysis, argument and structure analysis, key question generation in an " +
      "interactive and productive manner.",
  ogImage: `https://critique-neon.vercel.app/android-chrome-512x512.png`
})
</script>

<template>
homepage
  <NuxtLink to="/login">Login</NuxtLink>

  {{user ?? "no user"}}

</template>

<style scoped>

</style>