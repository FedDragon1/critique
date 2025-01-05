<script setup lang="ts">
import { useTime } from "~/composibles/useTime";
import OpenIcon from "~/components/svg/OpenIcon.vue";
import RenameIcon from "~/components/svg/RenameIcon.vue";
import CopyIcon from "~/components/svg/CopyIcon.vue";
import DeleteIcon from "~/components/svg/DeleteIcon.vue";
import DownloadIcon from "~/components/svg/DownloadIcon.vue";
import DropDown from "~/components/general/DropDown.vue";

defineProps<{
    name: string,
    lastModified: string,
    preview: string
}>();

const { makeDate } = useTime()

const showDots = ref(false)
</script>

<template>
    <div class="flex flex-col items-center justify-between bg-white gap-4 p-6 shadow-sm hover:shadow
                transition-all group rounded cursor-pointer">
        <div class="flex-grow w-full rounded border border-[#ECECEC] overflow-hidden">
            <img :src="preview" alt="Critique Preview" class="w-full h-full object-cover" />
        </div>
        <div class="flex w-full items-center gap-4">
            <div class="flex flex-col min-w-0 flex-grow">
                <h6 class="whitespace-nowrap text-ellipsis overflow-hidden min-w-0" :title="name">{{name}}</h6>
                <span class="text-sm text-zinc-500">{{makeDate(lastModified)}}</span>
            </div>
            <DropDown class="cursor-pointer opacity-0 group-hover:opacity-100 flex-shrink-0 transition"
                      :style="{ opacity: showDots ? '100' : '' }">
                <el-icon><el-icon-more-filled class="text-[#54577A]" /></el-icon>
                <template #dropdown>
                    <el-dropdown-menu @mouseenter="showDots = true" @mouseleave="showDots = false">
                        <el-dropdown-item :icon="OpenIcon">Open in new tab</el-dropdown-item>
                        <el-dropdown-item :icon="RenameIcon" divided>Rename</el-dropdown-item>
                        <el-dropdown-item :icon="CopyIcon">Copy</el-dropdown-item>
                        <el-dropdown-item :icon="DeleteIcon">Delete</el-dropdown-item>
                        <el-dropdown-item :icon="DownloadIcon" divided>Download</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </DropDown>
        </div>
    </div>
</template>

<style scoped>

</style>