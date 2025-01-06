<script setup lang="ts">
import { useTime } from "~/composibles/useTime";
import useContextMenu from "~/composibles/useContextMenu";
import ContextEnvironment from "~/components/document/ContextEnvironment.vue";

defineProps<{
    name: string,
    lastModified: string,
    preview: string
}>();

const { makeDate } = useTime()
const { fileMenuOptions } = useContextMenu()
</script>

<template>
    <ContextEnvironment :menu-options="fileMenuOptions">
        <template #default="scope">
            <div class="flex flex-col items-center justify-between bg-white gap-[12px] h-[280px] max-w-[350px] px-6 pt-6 pb-4 shadow-sm hover:shadow
                transition-all group rounded cursor-pointer">
                <div class="flex-grow w-full rounded border border-[#ECECEC] overflow-hidden">
                    <img :src="preview" alt="Critique Preview" class="w-full h-full object-cover" />
                </div>
                <div class="flex w-full items-center gap-4">
                    <div class="flex flex-col min-w-0 flex-grow">
                        <h6 class="whitespace-nowrap text-ellipsis overflow-hidden min-w-0" :title="name">{{name}}</h6>
                        <span class="text-sm text-zinc-500">{{makeDate(lastModified)}}</span>
                    </div>
                    <component :is="scope.dropdown" />
                </div>
            </div>
        </template>
    </ContextEnvironment>
</template>

<style scoped>

</style>