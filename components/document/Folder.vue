<script setup lang="ts">
import { useTime } from "~/composibles/useTime";
import FolderIcon from "~/components/svg/FolderIcon.vue";
import OpenIcon from "~/components/svg/OpenIcon.vue";
import RenameIcon from "~/components/svg/RenameIcon.vue";
import CopyIcon from "~/components/svg/CopyIcon.vue";
import DeleteIcon from "~/components/svg/DeleteIcon.vue";
import DropDown from "~/components/general/DropDown.vue";

defineProps<{
    name: string,
    lastModified: string,
}>();

const { makeDate } = useTime()
const showDots = ref(false)
</script>

<template>
    <div class="flex items-center justify-between bg-white w-[300px] gap-4 pl-6 pr-4 py-4 shadow-sm hover:shadow
                transition-all group rounded cursor-pointer">
        <div class="flex items-center gap-6 flex-grow min-w-0">
            <FolderIcon class="flex-shrink-0" />
            <div class="flex flex-col min-w-0 flex-grow">
                <h6 class="whitespace-nowrap text-ellipsis overflow-hidden min-w-0" :title="name">{{name}}</h6>
                <span class="text-sm text-zinc-500">{{makeDate(lastModified)}}</span>
            </div>
        </div>
        <DropDown class="cursor-pointer opacity-0 group-hover:opacity-100 flex-shrink-0"
                  :style="{ opacity: showDots ? '100' : '' }">
            <el-icon class="rotate-90"><el-icon-more-filled class="text-emphasis" /></el-icon>
            <template #dropdown>
                <el-dropdown-menu @mouseenter="showDots = true" @mouseleave="showDots = false">
                    <el-dropdown-item :icon="OpenIcon">Open in new tab</el-dropdown-item>
                    <el-dropdown-item :icon="RenameIcon" divided>Rename</el-dropdown-item>
                    <el-dropdown-item :icon="CopyIcon">Copy</el-dropdown-item>
                    <el-dropdown-item :icon="DeleteIcon">Delete</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </DropDown>
    </div>
</template>

<style scoped>

</style>