<script setup lang="ts">

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()

const stateMessage = ref("Signing you out...")
const errorMessage = ref("");
const message = ref("Wish to see you next time")
const router = useRouter();

async function signOut() {
  stateMessage.value = "Signing you out..."
  errorMessage.value = "";
  message.value = "Wish to see you next time";

  let { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error)
    stateMessage.value = "Error occurred!"
    errorMessage.value = error.toString();
    await retry(5);
  } else {
    stateMessage.value = "You are signed off!"
    setTimeout(() => router.push("/"), 2000);
  }
}

async function retry(sec: number) {
  if (sec == 0) {
    await signOut();
  } else {
    message.value = `Retrying in ${sec} second(s)`
    setTimeout(retry, 1000, sec - 1);
  }
}

await signOut();
</script>

<template>
  <SeoHead title="Logging out..." />
  <CardFrame>
    <template #title>
      {{ stateMessage }}
    </template>
    {{ message }}
    <pre v-if="errorMessage !== ''">{{ errorMessage }}</pre>
  </CardFrame>

</template>

<style scoped>

</style>