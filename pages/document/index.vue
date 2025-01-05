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
import NewFolderIcon from "~/components/svg/NewFolderIcon.vue";
import UploadDocumentIcon from "~/components/svg/UploadDocumentIcon.vue";
import PasteIcon from "~/components/svg/PasteIcon.vue";
import SelectAllIcon from "~/components/svg/SelectAllIcon.vue";
import RefreshIcon from "~/components/svg/RefreshIcon.vue";
import EyeSlashIcon from "~/components/svg/EyeSlashIcon.vue";

const client = useSupabaseClient()
const userStore = useUserStore();
const userAvatar = await userStore.getUserAvatar(client)

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

onMounted(() => {
    syncFolderHeight()
})

const folderMock = [
    {
        uuid: uuid(),
        name: "Folder Name",
        lastModified: new Date().toISOString()
    },
    {
        uuid: uuid(),
        name: "Very long folder 2 name this is",
        lastModified: "2011-10-05T14:48:00.000Z"
    },
    {
        uuid: uuid(),
        name: "Folder Name 3",
        lastModified: new Date().toISOString()
    },
    {
        uuid: uuid(),
        name: "Folder Name 4",
        lastModified: new Date().toISOString()
    },
    {
        uuid: uuid(),
        name: "Folder Name 5",
        lastModified: new Date().toISOString()
    },
    {
        uuid: uuid(),
        name: "Folder Name 6",
        lastModified: new Date().toISOString()
    },
]

const fileMock = [
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?1"
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?2"
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?3"
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?4"
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?5"
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?6"
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?7"
    },
]

const options = reactive<DocumentOptions>({
    view: "icon",
    sortBy: "date",
    order: "ascending"
})

const contextMenu: ContextMenuEntry[] = [
    {
        icon: NewFolderIcon,
        text: "New folder",
        hotkey: "Ctrl + Alt + N",
    },
    {
        icon: UploadDocumentIcon,
        text: "Upload document",
        hotkey: "Ctrl + Alt + Shift + N"
    },
    {
        icon: PasteIcon,
        text: "Paste",
        hotkey: "Ctrl + V",
        divided: true
    },
    {
        icon: SelectAllIcon,
        text: "Select all",
        hotkey: "Ctrl + A",
    },
    {
        icon: RefreshIcon,
        text: "Refresh",
        divided: true
    },
    {
        icon: EyeSlashIcon,
        text: "Show/Hide all folders",
        hotkey: "Ctrl + Alt + H"
    }
]
</script>

<template>
    <DashboardFrame activate="/document">
        <template #nav>
            <DashboardNav v-model:text="searchText" :user-avatar="userAvatar"/>
        </template>

        <ContextMenu class="gap-6 flex flex-col px-8 mb-8">
            <template #menu>
                <MenuFrame>
                    <MenuEntry v-for="entry in contextMenu" :key="entry.text" :divided="entry.divided">
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
                <div class="rounded bg-[#C54C4429] flex items-center p-4 gap-4 cursor-pointer">
                    <UploadIcon />
                    <span class="font-semibold">Upload Document</span>
                </div>
            </div>
            <hr class="m-0"/>
            <div class="w-full mb-4 overflow-hidden" v-if="folderMock.length">
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
            <div class="w-full flex flex-col gap-4">
                <span class="text-2xl">My files</span>
                <div class="grid grid-cols-5 gap-4">
                    <File v-for="file in fileMock" :key="file.uuid"
                          :name="file.name" :last-modified="file.lastModified" :preview="file.preview" />
                </div>
            </div>
        </ContextMenu>
    </DashboardFrame>
</template>

<style scoped>

</style>