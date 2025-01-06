<script setup lang="ts">

import FolderIcon from "~/components/svg/FolderIcon.vue";
import ContextEnvironment from "~/components/document/ContextEnvironment.vue";
import CritiqueIcon from "~/components/svg/CritiqueIcon.vue";
import Table from "~/components/general/Table.vue";
import TableRow from "~/components/general/TableRow.vue";
import useContextMenu from "~/composibles/useContextMenu";
import DocumentViewOptions from "~/components/document/DocumentViewOptions.vue";

defineProps<{
    aggregatedFiles: FileListEntry[]
}>()

const { folderMenuOptions, fileMenuOptions } = useContextMenu()

const options = defineModel<Record<string, string>>()
</script>

<template>
    <TableRow class="pl-6 sticky top-0 mt-2 bg-background z-20">
        <h3 class="flex-1 flex-grow-[2] text-lg tracking-[-0.6%]">Name</h3>
        <h3 class="flex-1 max-w-[20%] absolute text-lg tracking-[-0.6%]" id="align-col1">Last modified</h3>
        <h3 class="flex-1 max-w-[20%] absolute text-lg tracking-[-0.6%]" id="align-col2">File size</h3>
        <DocumentViewOptions v-model="options" />
    </TableRow>
    <Table class="w-full flex-grow mb-6">
        <div class="rounded-xl bg-white flex-grow">
            <ContextEnvironment v-for="(row, i) in aggregatedFiles" :key="row.uuid"
                                icon-class="rotate-90"
                                :menu-options="row.type === 'file' ? fileMenuOptions : folderMenuOptions">
                <template #default="scope">
                    <hr v-if="i !== 0" class="my-0 mx-3 border-[#efefef] mt-[-1px]">
                    <div class="rounded-xl hover:bg-[#F1F1F1] transition pl-8 pr-4 group flex w-full
                                   cursor-pointer whitespace-nowrap items-center gap-4 py-4 mt-[-1px]">
                        <div class="flex gap-7 flex-[2_0_0] items-center min-w-0">
                            <CritiqueIcon class="w-6" v-if="row.type === 'file'" />
                            <FolderIcon class="w-6" v-else />
                            <span class="overflow-hidden whitespace-nowrap text-ellipsis font-normal max-w-[60%] tracking-[-0.6%]"
                                  :title="row.name">{{row.name}}</span>
                        </div>
                        <span class="flex-[1_0_0] max-w-[30%] text-[#686F7B] col1 tracking-[-0.6%]">{{row.lastModified}}</span>
                        <span class="flex-[1_0_0] max-w-[10%] text-[#686F7B] col2 tracking-[-0.6%]">{{row.size}}</span>
                        <component :is="scope.dropdown" />
                    </div>
                </template>
            </ContextEnvironment>
        </div>
    </Table>
</template>

<style scoped>

</style>