<script setup lang="ts">
import type { Provider } from "@supabase/auth-js";
import SeoHead from "~/components/SeoHead.vue";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";

definePageMeta({
  middleware: 'login-redirect'
})

const supabase = useSupabaseClient();
const signInWith = async (provider: Provider) => {
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.origin}/login/callback`,
    }
  })
}

const signInWithPassword = async () => {

}

const signInForm = reactive({
  email: '',
  password: ''
})

</script>

<template>
  <SeoHead title="Sign In"/>

  <CardFrame :header-max-height="75">
    <template #title>Sign in</template>
    <div class="oauth">
      <el-button plain class="oauth-button" @click="signInWith('google')">
        <font-awesome :icon="faGoogle"/>
        Sign In with Google
      </el-button>
      <el-button plain class="oauth-button" @click="signInWith('github')">
        <font-awesome :icon="faGithub"/>
        Sign In with GitHub
      </el-button>
    </div>
    <hr>
    <el-form :model="signInForm" label-width="auto" class="form">
      <el-form-item label="Email">
        <el-input v-model="signInForm.email" class="form-element"/>
      </el-form-item>
      <el-form-item label="Password">
        <el-input type="password" show-password v-model="signInForm.password" class="form-element"/>
      </el-form-item>
      <el-form-item class="submit-button">
        <el-button type="primary" @click="signInWithPassword" plain>Sign In</el-button>
      </el-form-item>
    </el-form>
  </CardFrame>
</template>

<style scoped>
.submit-button {
  float: right;
}

.oauth {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.oauth-button {
  width: 100%;
  margin: 0;
  height: 35px;
}

.form-element {
  height: 35px;
}

:deep(.oauth-button span) {
  gap: 10px;
}

:deep(.form .el-form-item) {
  align-items: center;
}
</style>