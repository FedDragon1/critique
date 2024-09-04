<script setup lang="ts">
</script>

<template>
  <div class="form-wrapper">
    <slot/>
    <!--  TODO: no functionality-->
    <slot name=footer>
      <span><NuxtLink to="/"><u>Forgot your password</u></NuxtLink></span>
      <span>Don't have an account? <NuxtLink to="/register"><u>Sign up</u></NuxtLink></span>
    </slot>
  </div>
</template>

<style scoped>
.form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

u {
  color: var(--el-text-color-primary)
}

u:hover {
  color: var(--el-color-primary)
}

:deep(.el-form-item__content) {
  width: 100%;
  margin-left: 0 !important;
}

span {
  line-height: 2.4rem;
}

:deep(form .el-form-item) {
  flex-direction: column;
}

:deep(form .el-form-item__label-wrap) {
  margin-left: 0 !important;
}

:deep(form) {
  width: 100%
}
</style>