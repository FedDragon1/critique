<script setup lang="ts">
import SeoHead from "~/components/SeoHead.vue";
import OAuthDisplay from "~/components/oauth/OAuthDisplay.vue";
import EmailPasswordForm from "~/components/form/LoginForm.vue";

definePageMeta({
  middleware: 'login-redirect'
})

const supabase = useSupabaseClient();

const signInWithPassword = async () => {
  const { data, error } = await supabase.auth.signInWithPassword(signInForm);
  if (error) {
    ElMessage.error(error.message);
  }
}

const signInForm = reactive({
  email: '',
  password: ''
})

</script>

<template>
  <SeoHead title="Sign In"/>

  <CardFrame :header-max-height="60">
    <template #title>Sign in</template>
    <OAuthDisplay/>
    <hr>
    <EmailPasswordForm :model="signInForm" @login="signInWithPassword" />
    <NuxtLink to="/register" class="register"><el-text type="primary">Don't have an account? Register</el-text></NuxtLink>
  </CardFrame>
</template>

<style scoped>
.register {
  text-decoration: none;
}

:deep(.form .el-form-item) {
  align-items: center;
}
</style>