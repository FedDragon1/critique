<script setup lang="ts">
import OAuthButton from "@/components/oauth/OAuthButton.vue";
</script>

<template>
  <div class="oauth">
    <div class="legend">
      <hr>
      <span>Or continue with</span>
    </div>
    <div class="oauth-buttons">
      <OAuthButton provider="GitHub" />
      <OAuthButton provider="Google" />
    </div>
  </div>
</template>

<style scoped>
.oauth {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.oauth-buttons {
  display: flex;
  flex-direction: row;
  gap: 30px;
  justify-content: center;
}

hr {
  width: 100%;
  border: 1px solid var(--el-border-color);
  margin: 10px 0 0 0;
}

.legend {
  display: flex;
  flex-direction: column;
  align-items: center;
}

span {
  line-height: 1.2rem;
  font-size: 1.2rem;
  translate: 0 -0.6rem;
  background: white;
  padding: 0 20px;
}

:deep(.oauth-button span) {
  gap: 10px;
}
</style>