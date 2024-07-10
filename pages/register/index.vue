<script setup lang="ts">

import OAuthDisplay from "~/components/oauth/OAuthDisplay.vue";
import RegisterForm from "~/components/form/RegisterForm.vue";

const form = reactive({
  email: '',
  password: '',
  repeatPassword: ''
})
const supabase = useSupabaseClient()
const router = useRouter()

async function onRegister() {
  if (!validateEmail() || !validatePassword()) {
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password
  })


  if (error) {
    ElMessage.error(error.message);
    return;
  } else {
    ElMessage.success("Sign up success")
    setTimeout(() => router.push("/register/callback"))
  }
}

function validateEmail() {
  if (form.email.match(/\w[\w.]+\w@\w+\.[\w+.]+\w+/) === null) {
    ElMessage.error("Invalid email");
    return false;
  }
  return true;
}

function validatePassword() {
  if (form.password !== form.repeatPassword) {
    ElMessage.error("Passwords do not match")
    return false;
  }
  if (form.password.length < 8) {
    ElMessage.error("Password must be longer than 8 characters")
    return false;
  }
  if (form.password.match(/[0-9]/) === null) {
    ElMessage.error("Password must contain a number")
    return false
  }
  if (form.password.match(/[a-z]/) === null) {
    ElMessage.error("Password must contain a lowercase letter (a-z)")
    return false;
  }
  if (form.password.match(/[A-Z]/) === null) {
    ElMessage.error("Password must contain an uppercase letter (A-Z)")
    return false;
  }
  if (form.password.match(/[`*@\/\\.'";:<>\-_=+#$%^&]/) === null) {
    ElMessage.error("Password must contain a special symbol (`*@\/\\.'\";:<>-_=+#$%^&)")
    return false;
  }
  return true;
}
</script>

<template>
<SeoHead title="Sign Up" />

<CardFrame :header-max-height="60">
  <template #title>
    Sign up
  </template>
  <OAuthDisplay/>
  <hr>
  <RegisterForm :model="form" @register="onRegister" />
</CardFrame>
</template>

<style scoped>

</style>