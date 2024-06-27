<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()

const stateMessage = ref("Signing you out...")
const errorMessage = ref("")
const router = useRouter();

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error)
    stateMessage.value = "Error occurred while signing out (retrying in 5 seconds): "
    errorMessage.value = error.toString();
    setTimeout(async () => await signOut(), 5000);
  } else {
    stateMessage.value = "You are signed off! Redirecting..."
    setTimeout(() => router.push("/"), 2000);
  }
}


await signOut();
</script>

<template>
{{ stateMessage }}
  <pre>{{ errorMessage }}</pre>
</template>

<style scoped>

</style>