<script setup lang="ts">
import {useSupabaseUser} from "#imports";

definePageMeta({
    middleware: 'auth'
})

const router = useRouter()

const user = useSupabaseUser()
const userStore = useUserStore()

onMounted(() => {
    if (user.value === null) {
        ElMessage.error("No user")
        return
    }

    if (!userStore.getUserAuth) {
        // OAuth
        userStore.setUserAuth(user.value)
    }
    setTimeout(() => {
        router.push('/dashboard');
    }, 1000)
})
</script>

<template>
  <SeoHead title="Logging in..." />
  <CallbackFrame>
    <template #title>
      You are signed in!
    </template>
    Redirecting you to the dashboard...
  </CallbackFrame>
</template>

<style scoped>

</style>