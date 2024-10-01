export default defineNuxtRouteMiddleware(async () => {
    const user = useSupabaseUser();

    if (!user.value) {
        ElMessage.info("Please login first")
        return navigateTo("/login");
    }

    const userStore = useUserStore();
    userStore.setUserAuth(user.value);
    await userStore.getUserInfo
})