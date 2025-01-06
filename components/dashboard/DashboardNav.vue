<script setup lang="ts">
import UserIcon from "~/components/svg/UserIcon.vue";
import BillingIcon from "~/components/svg/BillingIcon.vue";
import SettingsIcon from "~/components/svg/SettingsIcon.vue";
import LogoutIcon from "~/components/svg/LogoutIcon.vue";

const model = defineModel<string>("text")
const router = useRouter()

const client = useSupabaseClient()
const userStore = useUserStore();
const userAvatar = await userStore.getUserAvatar(client)
const userInfo = await userStore.getUserInfo

const userActions: ContextMenuEntry[] = [
    {
        text: "Manage Account",
        icon: UserIcon,
        divided: true,
    },
    {
        text: "Billing Icon",
        icon: BillingIcon,
    },
    {
        text: "Settings",
        icon: SettingsIcon,
        callback: () => router.push("/setting")
    },
    {
        text: "Logout",
        icon: LogoutIcon,
        divided: true,
        callback: () => router.push("/logout")
    }
]
</script>

<template>
    <nav class="flex-shrink-0 pl-10 pr-5 flex items-center justify-between gap-2.5 h-nav border-b sticky bg-background top-0 z-40">
        <div class="flex items-center gap-2 text-sm w-[350px] h-10 px-4 bg-white rounded-lg shadow-sm">
            <el-icon>
                <el-icon-search class="text-zinc-500"/>
            </el-icon>
            <input v-model="model" autocomplete="off" placeholder="Search for anything..."
                   class="h-full outline-none"/>
        </div>

        <div class="h-10 w-10 rounded-full overflow-hidden border box-border">
            <el-dropdown class="w-full h-full" placement="bottom-end">
                <div class="w-full h-full outline-none">
                    <img :src="userAvatar" alt="User Avatar" class="w-full h-full bg-contain outline-none" />
                </div>
                <template #dropdown>
                    <div class="w-[280px] pb-1 px-2">
                        <div class="flex flex-col justify-center items-center mt-8 px-4">
                            <img :src="userAvatar" alt="User Avatar" class="w-16 h-16 bg-contain" />
                            <span class="mt-3 mb-1 text-[1rem]">{{ userInfo.displayName }}</span>
                            <span class="text-[#747474] text-sm font-light mb-4">{{ userInfo.email }}</span>
                        </div>
                        <div v-for="action in userActions"
                             :class="{ 'border-t': action.divided }"
                             :key="action.text"
                             class="text-sm cursor-pointer"
                             @click="action.callback">
                            <div class="hover:bg-[#F2F2F2] rounded my-1 w-full flex items-center gap-4 py-3 px-4 transition">
                                <component :is="action.icon" class="w-4 h-4" />
                                <div class="flex gap-2.5 items-center justify-center text-[#3f3f3f]">
                                    <span>{{ action.text }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </el-dropdown>
        </div>
    </nav>
</template>

<style scoped>

</style>