<script setup lang="ts">
import { faArrowRightFromBracket, faGear } from "@fortawesome/free-solid-svg-icons";

defineProps<{
    userAvatar?: string
}>()

const model = defineModel<string>("text")
const router = useRouter()

const userActions: UserActions[] = [
    {
        display: "Settings",
        icon: faGear,
        callback: () => router.push("/setting")
    },
    {
        display: "Logout",
        icon: faArrowRightFromBracket,
        callback: () => router.push("/logout")
    }
]
</script>

<template>
    <nav class="flex-shrink-0 pl-10 pr-5 flex items-center justify-between gap-2.5 mb-5 h-nav border-b sticky bg-background top-0 z-40">
        <div class="flex items-center gap-2 text-sm w-[350px] h-10 px-4 bg-white rounded-lg shadow-sm">
            <el-icon>
                <el-icon-search class="text-zinc-500"/>
            </el-icon>
            <input v-model="model" autocomplete="off" placeholder="Search for anything..."
                   class="h-full outline-none"/>
        </div>

        <div class="h-10 w-10 rounded-full overflow-hidden border box-border">
            <el-dropdown class="w-full h-full">
                <div class="w-full h-full bg-contain outline-none"
                     :style="{'background-image': `url('${userAvatar}')`}"/>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-for="action in userActions"
                                          :key="action.display"
                                          @click="action.callback">
                            <div class="flex gap-2.5 items-center justify-center">
                                <font-awesome :icon="action.icon"/>
                                <span>{{ action.display }}</span>
                            </div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </nav>
</template>

<style scoped>

</style>