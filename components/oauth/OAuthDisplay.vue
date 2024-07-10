<script setup lang="ts">
import OAuthButton from "@/components/oauth/OAuthButton.vue";
</script>

<template>
  <div class="oauth">
    <OAuthButton provider="Google" />
    <OAuthButton provider="GitHub" />
  </div>
</template>

<style scoped>
.oauth {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

:deep(.oauth-button span) {
  gap: 10px;
}
</style>