export default defineNuxtRouteMiddleware(async () => {
    const user = useSupabaseUser();

    if (user.value) {
        const userStore = useUserStore();
        userStore.setUserAuth(user.value);
        await userStore.getUserInfo
        return navigateTo("/dashboard");
    }
})