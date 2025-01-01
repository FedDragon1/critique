<script setup lang="ts">
import DashboardNav from "~/components/dashboard/DashboardNav.vue";

const client = useSupabaseClient()
const userStore = useUserStore();
const userAvatar = await userStore.getUserAvatar(client)

const searchText = ref("");
</script>

<template>
    <DashboardFrame activate="/document" class="gap-10 flex flex-col p-12">
        <template #nav>
            <DashboardNav v-model:text="searchText" :user-avatar="userAvatar" />
        </template>

        Documents
    </DashboardFrame>
</template>

<style scoped>

</style>