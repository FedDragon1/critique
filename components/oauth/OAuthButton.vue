<script setup lang="ts">
import type {Provider} from "@supabase/auth-js";
import {faGithub, faGoogle} from "@fortawesome/free-brands-svg-icons";

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
  });
}
</script>

<template>
    <font-awesome size="xl"
                  :icon="getIcon[provider]"
                  class="oauth-button"
                  @click="signInWith(provider as Provider)" />
</template>

<style scoped>
.oauth-button {
  width: 1.5rem;
  margin: 0;
  display: inline;
  transition: 0.2s color ease-in-out;
  cursor: pointer;
}

.oauth-button:hover {
  color: var(--el-color-primary)
}
</style>