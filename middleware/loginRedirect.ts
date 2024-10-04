export default defineNuxtRouteMiddleware(async () => {
    const user = useSupabaseUser();

    if (user.value && user.value?.user_metadata.email_verified) {
        const userStore = useUserStore();
        userStore.setUserAuth(user.value);
        await userStore.getUserInfo
        return navigateTo("/dashboard");
    }
})