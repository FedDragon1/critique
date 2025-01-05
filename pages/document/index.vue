<script setup lang="ts">
import DashboardNav from "~/components/dashboard/DashboardNav.vue";
import TweakingIcon from "~/components/svg/TweakingIcon.vue";

import { v4 as uuid } from 'uuid'
import Folder from "~/components/document/Folder.vue";
import File from "~/components/document/File.vue";
import UploadIcon from "~/components/svg/UploadIcon.vue";
import DropDown from "~/components/general/DropDown.vue";
import SelectGroup from "~/components/general/SelectGroup.vue";
import SelectEntry from "~/components/general/SelectEntry.vue";
import ContextMenu from "~/components/general/ContextMenu.vue";
import MenuFrame from "~/components/general/MenuFrame.vue";
import MenuEntry from "~/components/general/MenuEntry.vue";
import { useTime } from "~/composibles/useTime";
import { useFile } from "~/composibles/useFile";
import CritiqueIcon from "~/components/svg/CritiqueIcon.vue";
import FolderIcon from "~/components/svg/FolderIcon.vue";
import TableRow from "~/components/general/TableRow.vue";
import Table from "~/components/general/Table.vue";
import ContextEnvironment from "~/components/document/ContextEnvironment.vue";
import useContextMenu from "~/composibles/useContextMenu";

const client = useSupabaseClient()
const userStore = useUserStore();
const userAvatar = await userStore.getUserAvatar(client)

const { makeDate } = useTime()
const { makeFileSize } = useFile()
const { generalMenuOptions, folderMenuOptions, fileMenuOptions } = useContextMenu()

const searchText = ref("");

// FOLDER

const showFolder = ref(true)
const folder = useTemplateRef<HTMLDivElement>("folder")

function syncFolderHeight() {
    if (folder.value) {
        const oldHeight = folder.value.style.height
        folder.value.style.height = "auto"
        const { height } = folder.value.getBoundingClientRect()
        folder.value.style.height = oldHeight
        requestAnimationFrame(() => {
            folder.value!.style.height = `${height + 5}px`
        })
    }
}

function toggleFolders() {
    showFolder.value = !showFolder.value
    if (showFolder.value) {
        syncFolderHeight()
    } else if (folder.value) {
        folder.value.style.height = "0"
    }
}

const folderMock = ref([
    {
        uuid: uuid(),
        name: "Folder Name",
        lastModified: new Date().toISOString(),
        size: 129472784
    },
    {
        uuid: uuid(),
        name: "Very long folder 2 name this is",
        lastModified: "2011-10-05T14:48:00.000Z",
        size: 129472784
    },
    {
        uuid: uuid(),
        name: "Folder Name 3",
        lastModified: new Date().toISOString(),
        size: 129472784
    },
    {
        uuid: uuid(),
        name: "Folder Name 4",
        lastModified: new Date().toISOString(),
        size: 129472784
    },
    {
        uuid: uuid(),
        name: "Folder Name 5",
        lastModified: new Date().toISOString(),
        size: 129472784
    },
    {
        uuid: uuid(),
        name: "Folder Name 6",
        lastModified: new Date().toISOString(),
        size: 129472784
    },
])

const fileMock = ref([
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?1",
        size: 18273
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?2",
        size: 18273
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?3",
        size: 18273
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?4",
        size: 18273
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?5",
        size: 18273
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?6",
        size: 18273
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?7",
        size: 18273
    },
])

const aggregatedFiles = computed(() =>
    [
        ...folderMock.value.map(folder => ({
            uuid: folder.uuid,
            type: "folder",
            name: folder.name,
            lastModified: makeDate(folder.lastModified),
            size: makeFileSize(folder.size)
        })),
        ...fileMock.value.map(file => ({
            uuid: file.uuid,
            type: "file",
            name: file.name,
            lastModified: makeDate(file.lastModified),
            size: makeFileSize(file.size)
        }))
    ] as FileListEntry[]
)

const options = reactive<DocumentOptions>({
    view: "icon",
    sortBy: "date",
    order: "ascending"
})

// TABLE

function align(headSelector: string, colSelector: string) {
    const head = document.querySelector(headSelector) as HTMLSpanElement
    const col = document.querySelector(colSelector) as HTMLSpanElement

    if (!head || !col) {
        return
    }

    head.style.transform = ""

    const { left } = col.getBoundingClientRect()
    const { left: buf } = head.getBoundingClientRect()

    head.style.transform = `translateX(${left - buf}px)`
}

function alignRaf() {
    align("#align-col1", ".col1")
    align("#align-col2", ".col2")
    requestAnimationFrame(alignRaf)
}

onMounted(() => {
    syncFolderHeight()
    alignRaf()
})
</script>

<template>
    <DashboardFrame activate="/document" :overflow="options.view === 'list' ? 'hidden' : 'auto'" class="flex-grow min-h-0">
        <template #nav>
            <DashboardNav v-model:text="searchText" :user-avatar="userAvatar"/>
        </template>

        <ContextMenu class="gap-6 flex flex-col px-8 mb-8 h-full">
            <template #menu>
                <MenuFrame>
                    <MenuEntry v-for="entry in generalMenuOptions" :key="entry.text" :divided="entry.divided">
                        <template #icon>
                            <component :is="entry.icon" width="16" height="16" fill="#222222" />
                        </template>
                        <span>{{entry.text}}</span>
                        <template #hotkey>
                            <span>{{entry.hotkey}}</span>
                        </template>
                    </MenuEntry>
                </MenuFrame>
            </template>

            <div class="flex justify-between items-center">
                <span class="font-medium text-xl">Document</span>
                <NuxtLink class="rounded bg-[#C54C4429] flex items-center px-4 py-3 gap-3 cursor-pointer border border-transparent
                            hover:bg-transparent hover:border-primary hover:text-primary transition"
                          to="/analytic">
                    <UploadIcon class="w-5" />
                    <span class="font-semibold text-sm">Upload Document</span>
                </NuxtLink>
            </div>
            <hr class="m-0"/>

            <template v-if="options.view === 'icon'">
                <div class="w-full mb-4 overflow-hidden flex-shrink-0" v-if="folderMock.length">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex gap-4 items-center">
                            <span class="text-2xl">My folders</span>
                            <el-icon class="cursor-pointer transition-all" :class="{'rotate-180': !showFolder}" @click="toggleFolders">
                                <el-icon-caret-bottom/>
                            </el-icon>
                        </div>
                        <div>
                            <DropDown>
                                <TweakingIcon width="24" stroke="#292D32" height="24"/>
                                <template #dropdown>
                                    <SelectGroup name="View" class="mt-2">
                                        <SelectEntry v-model="options" entry="view" value="icon">Large icon view</SelectEntry>
                                        <SelectEntry v-model="options" entry="view" value="list">Detail lists</SelectEntry>
                                    </SelectGroup>
                                    <SelectGroup name="Sort by">
                                        <SelectEntry v-model="options" entry="sortBy" value="date">Date modified</SelectEntry>
                                        <SelectEntry v-model="options" entry="sortBy" value="name">Name</SelectEntry>
                                        <SelectEntry v-model="options" entry="sortBy" value="size">File size</SelectEntry>
                                    </SelectGroup>
                                    <div class="mb-2">
                                        <SelectEntry v-model="options" entry="order" value="ascending" divided>Ascending</SelectEntry>
                                        <SelectEntry v-model="options" entry="order" value="descending">Descending</SelectEntry>
                                    </div>
                                </template>
                            </DropDown>
                        </div>
                    </div>
                    <div class="grid grid-cols-5 transition-all duration-500 gap-4 items-start" ref="folder">
                        <Folder v-for="folder in folderMock" :key="folder.uuid"
                                :name="folder.name" :last-modified="folder.lastModified"/>
                    </div>
                </div>
                <div class="w-full flex flex-col gap-4 flex-shrink-0">
                    <span class="text-2xl">My files</span>
                    <div class="grid grid-cols-5 gap-4">
                        <File v-for="file in fileMock" :key="file.uuid"
                              :name="file.name" :last-modified="file.lastModified" :preview="file.preview" />
                    </div>
                </div>
            </template>
            <template v-else>
                <Table class="w-full flex-grow min-h-0 mb-6 relative">
                    <TableRow class="pl-6">
                        <h3 class="flex-1 flex-grow-[2] text-lg">Name</h3>
                        <h3 class="flex-1 max-w-[20%] absolute text-lg" id="align-col1">Last modified</h3>
                        <h3 class="flex-1 max-w-[20%] absolute text-lg" id="align-col2">File size</h3>
                        <DropDown class="w-8">
                            <TweakingIcon width="24" stroke="#292D32" height="24"/>
                            <template #dropdown>
                                <SelectGroup name="View" class="mt-2">
                                    <SelectEntry v-model="options" entry="view" value="icon">Large icon view</SelectEntry>
                                    <SelectEntry v-model="options" entry="view" value="list">Detail lists</SelectEntry>
                                </SelectGroup>
                                <SelectGroup name="Sort by">
                                    <SelectEntry v-model="options" entry="sortBy" value="date">Date modified</SelectEntry>
                                    <SelectEntry v-model="options" entry="sortBy" value="name">Name</SelectEntry>
                                    <SelectEntry v-model="options" entry="sortBy" value="size">File size</SelectEntry>
                                </SelectGroup>
                                <div class="mb-2">
                                    <SelectEntry v-model="options" entry="order" value="ascending" divided>Ascending</SelectEntry>
                                    <SelectEntry v-model="options" entry="order" value="descending">Descending</SelectEntry>
                                </div>
                            </template>
                        </DropDown>
                    </TableRow>
                    <div class="rounded bg-white flex-grow overflow-y-auto">
                        <ContextEnvironment v-for="row in aggregatedFiles" :key="row.uuid"
                                            :menu-options="row.type === 'file' ? fileMenuOptions : folderMenuOptions"
                                            class="rounded hover:bg-[#F1F1F1] transition pl-8 pr-4 group flex w-full whitespace-nowrap items-center gap-4 py-4">
                            <div class="flex gap-4 flex-1 flex-grow-[2]">
                                <CritiqueIcon class="w-6" v-if="row.type === 'file'" />
                                <FolderIcon class="w-6" v-else />
                                <span>{{row.name}}</span>
                            </div>
                            <span class="flex-1 max-w-[30%] text-[#686F7B] col1">{{row.lastModified}}</span>
                            <span class="flex-1 max-w-[10%] text-[#686F7B] col2">{{row.size}}</span>
                        </ContextEnvironment>
                    </div>
                </Table>
            </template>
        </ContextMenu>
    </DashboardFrame>
</template>

<style scoped>

</style>