<script setup lang="ts">
import type {Provider} from "@supabase/auth-js";
import {faGithub, faGoogle, type IconDefinition} from "@fortawesome/free-brands-svg-icons";

type SupportedProviders = "Google" | "GitHub";

defineProps<{
  provider: SupportedProviders
}>()

const getIcon = {
  "GitHub": faGithub,
  "Google": faGoogle
}

const supabase = useSupabaseClient();
const signInWith = async (provider: Provider) => {
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.origin}/login/callback`,
    }
  })
}
</script>

<template>
  <el-button plain class="oauth-button" @click="signInWith(provider as Provider)">
    <font-awesome :icon="getIcon[provider]"/>
    Sign In with {{provider}}
  </el-button>
</template>

<style scoped>
.oauth-button {
  width: 100%;
  margin: 0;
  height: 35px;
}
</style>