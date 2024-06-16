<script setup lang="ts">
const supabase = useSupabaseClient();


const signInWithGoogle = async() => {
  const ret = await supabase.auth.signInWithOAuth({
    provider: "google"
  })
  console.log(ret)
}
const signInWithGithub = async() => {
  const ret = await supabase.auth.signInWithOAuth({
    provider: "github"
  })
  console.log(ret)
}

</script>

<template>
<button type="button" @click="signInWithGoogle">Login with Google</button>
<button type="button" @click="signInWithGithub">Login with Github</button>
</template>

<style scoped>

</style>