<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
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
    <nav class="pl-10 pr-5 flex items-center justify-between gap-2.5 mb-5 h-nav border-b">
        <el-input v-model="model" autocomplete="off" clearable placeholder="Search critiques"
                  :prefix-icon="Search" class="h-10" style="width: 350px; border: none"/>
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