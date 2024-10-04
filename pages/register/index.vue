<script setup lang="ts">
import OAuthDisplay from "~/components/oauth/OAuthDisplay.vue";
import RegisterForm from "~/components/form/RegisterForm.vue";
import ReturnNav from "~/components/login/ReturnNav.vue";
import CardFrame from "~/components/login/CardFrame.vue";
import type {BaseResponse, EmailExistRequest, EmailExistResponse, NewUserRequest} from "~/types/requests";
import {useUserStore} from "~/stores/userStore";

const form = reactive({
    username: '',
    email: '',
    password: ''
})
const supabase = useSupabaseClient()
const userStore = useUserStore()
const router = useRouter()

async function onRegister() {
    if (!validateEmail() || !validatePassword() || !validateUsername()) {
        return;
    }

    let success = true;
    const existRequest: EmailExistRequest = {
        email: form.email
    }
    const existResp = await $fetch<BaseResponse<EmailExistResponse>>("/api/user/repeat", {
        method: "POST",
        body: existRequest
    })

    if (!existResp.success) {
        ElMessage.error(existResp.errorMessage);
        return;
    }
    if (existResp.data?.exist) {
        if (existResp.data?.verified) {
            // repeat sign up
            ElMessage.error("A user already exists with the email")
            return;
        }
        // resend email
        ElMessage.warning("An unverified user is associated with the email")
        success = false
    }

    const {data, error} = await supabase.auth.signUp({
        email: form.email,
        password: form.password
    })

    if (error) {
        ElMessage.error(error.message);
        return;
    }
    if (data.user === null) {
        ElMessage.error("No user received")
        return;
    }

    if (!success) {
        // data exist in database, dont send again
        setTimeout(() => router.push("/register/callback"))
        return;
    }

    const requestBody: NewUserRequest = {
        name: form.username,
        uuid: data.user.id,
        email: form.email,
        validated: false
    }
    const response = await $fetch<BaseResponse<CritiqueUser>>("/api/user", {
        method: "POST",
        body: requestBody
    })

    if (!response.success || !response.data) {
        ElMessage.error(response.errorMessage ?? "No user")
        return;
    }

    userStore.setUserAuth(data.user)
    userStore.setUserInfo(response.data)
    ElMessage.success("Sign up success")
    setTimeout(() => router.push("/register/callback"))
}

function validateUsername() {
    if (form.username.length > 20) {
        ElMessage.error("User name too long (>20)")
        return false
    }
    return true
}

function validateEmail() {
    if (form.email.match(/\w[\w.]+\w@\w+\.[\w+.]+\w+/) === null) {
        ElMessage.error("Invalid email");
        return false;
    }

    return true;
}

function validatePassword() {
    if (form.password.length < 8) {
        ElMessage.error("Password must be longer than 8 characters")
        return false;
    }
    if (form.password.match(/[0-9]/) === null) {
        ElMessage.error("Password must contain a number")
        return false
    }
    if (form.password.match(/[a-z]/) === null) {
        ElMessage.error("Password must contain a lowercase letter (a-z)")
        return false;
    }
    if (form.password.match(/[A-Z]/) === null) {
        ElMessage.error("Password must contain an uppercase letter (A-Z)")
        return false;
    }
    if (form.password.match(/[`*@\/\\.'";:<>\-_=+#$%^&]/) === null) {
        ElMessage.error("Password must contain a special symbol (`*@\/\\.'\";:<>-_=+#$%^&)")
        return false;
    }
    return true;
}
</script>

<template>
    <SeoHead title="Sign Up"/>

    <ReturnNav></ReturnNav>

    <CardFrame :header-max-height="40">
        <template #title>
            Create an Account
        </template>
        <RegisterForm :model="form" @register="onRegister"/>
        <template #footer>
            <OAuthDisplay/>
        </template>
    </CardFrame>
</template>

<style scoped>

</style>