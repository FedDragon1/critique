<script setup lang="ts">
import type {BaseResponse, VerifyUserRequest} from "~/types/requests";

definePageMeta({
    middleware: 'auth'
})

const router = useRouter()
const user = useSupabaseUser()

function verify(uuid: string) {
    const request: VerifyUserRequest = {
        uuid
    }
    $fetch<BaseResponse<CritiqueUser>>("/api/user/verify", {
        method: "POST",
        body: request
    }).then(resp => {
        if (!resp.success) {
            ElMessage.error("Failed to verify the account")
            return
        }
        setTimeout(() => {
            router.push('/dashboard');
        }, 1000)
    })
}

onMounted(() => {
    if (user.value === null || !user.value.id) {
        ElMessage.error("No user")
        return
    }

    verify(user.value!.id)
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