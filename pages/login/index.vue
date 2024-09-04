<script setup lang="ts">
import SeoHead from "~/components/SeoHead.vue";
import OAuthDisplay from "~/components/oauth/OAuthDisplay.vue";
import EmailPasswordForm from "~/components/form/LoginForm.vue";
import ReturnNav from "~/components/login/ReturnNav.vue";

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

  <ReturnNav></ReturnNav>

  <CardFrame :header-max-height="40">
    <template #title>Log in</template>
    <EmailPasswordForm :model="signInForm" @login="signInWithPassword" />
<!--    <OAuthDisplay/>-->
    <template #footer><OAuthDisplay/></template>
  </CardFrame>
</template>

<style scoped>


</style>