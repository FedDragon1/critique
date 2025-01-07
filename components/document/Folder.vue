<script setup lang="ts">
import { useTime } from "~/composibles/useTime";
import FolderIcon from "~/components/svg/FolderIcon.vue";
import ContextEnvironment from "~/components/document/ContextEnvironment.vue";
import useContextMenu from "~/composibles/useContextMenu";

defineProps<{
    name: string,
    lastModified: string,
}>();

const { makeDate } = useTime()
const { folderMenuOptions } = useContextMenu()
</script>

<template>
    <ContextEnvironment :menu-options="folderMenuOptions" icon-class="rotate-90">
        <template #default="scope">
            <div class="flex items-center justify-between bg-white max-w-[350px] gap-4 pl-6 pr-4 py-4 shadow-sm hover:shadow
                transition-all group rounded cursor-pointer">
                <div class="flex items-center gap-6 flex-grow min-w-0">
                    <FolderIcon class="flex-shrink-0" />
                    <div class="flex flex-col min-w-0 flex-grow">
                        <h6 class="whitespace-nowrap text-ellipsis overflow-hidden min-w-0" :title="name">{{name}}</h6>
                        <span class="text-sm text-zinc-500 whitespace-nowrap text-ellipsis overflow-hidden min-w-0">{{makeDate(lastModified)}}</span>
                    </div>
                </div>
                <component :is="scope.dropdown" />
            </div>
        </template>
    </ContextEnvironment>
</template>

<style scoped>

</style>