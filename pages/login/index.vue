<script setup lang="ts">
import SeoHead from "~/components/SeoHead.vue";
import OAuthDisplay from "~/components/oauth/OAuthDisplay.vue";
import EmailPasswordForm from "~/components/form/LoginForm.vue";
import ReturnNav from "~/components/login/ReturnNav.vue";
import CardFrame from "~/components/login/CardFrame.vue";
import {useUserStore} from "~/stores/userStore";

definePageMeta({
    middleware: 'login-redirect'
})

const supabase = useSupabaseClient();
const userStore = useUserStore()
const router = useRouter()

const signInWithPassword = async () => {
    const {data, error} = await supabase.auth.signInWithPassword(signInForm);
    if (error) {
        ElMessage.error(error.message);
        return;
    }
    if (data.user === null) {
        ElMessage.error("No user received")
        return;
    }
    if (!signInForm.rememberMe) {
        window.onbeforeunload = () => {
            supabase.auth.signOut()
        }
    }
    userStore.setUserAuth(data.user)
    await router.push("/login/callback")
}

const signInForm = reactive({
    email: '',
    password: '',
    rememberMe: true
})

</script>

<template>
    <SeoHead title="Sign In"/>

    <ReturnNav></ReturnNav>

    <CardFrame :header-max-height="40">
        <template #title>Log in</template>
        <EmailPasswordForm :model="signInForm" @login="signInWithPassword"/>
        <template #footer>
            <OAuthDisplay/>
        </template>
    </CardFrame>
</template>

<style scoped>


</style>