<script setup lang="ts">
import type { Provider } from "@supabase/auth-js";

const supabase = useSupabaseClient();
let user = useSupabaseUser();

const signInWith = async (provider: Provider) => {
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.origin}/login/callback`,
    }
  })
}

function update() {
  user = useSupabaseUser();
  console.log(user);
}

</script>

<template>
<button type="button" @click="signInWith('google')">Login with Google</button>
<button type="button" @click="signInWith('github')">Login with Github</button>
<button type="button" @click="update()">refresh</button>

  {{user ?? "no user"}}
</template>

<style scoped>

</style>