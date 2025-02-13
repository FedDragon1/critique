<script setup lang="ts">
import DashboardNav from "~/components/dashboard/DashboardNav.vue";
import { v4 as uuid } from 'uuid'
import Folder from "~/components/document/Folder.vue";
import File from "~/components/document/File.vue";
import UploadIcon from "~/components/svg/UploadIcon.vue";
import ContextMenu from "~/components/general/ContextMenu.vue";
import MenuFrame from "~/components/general/MenuFrame.vue";
import MenuEntry from "~/components/general/MenuEntry.vue";
import { useTime } from "~/composibles/useTime";
import { useFile } from "~/composibles/useFile";
import useContextMenu from "~/composibles/useContextMenu";

definePageMeta({
    middleware: 'auth'
})

const { makeDate } = useTime()
const { makeFileSize } = useFile()
const { generalMenuOptions } = useContextMenu()

// DATA

const searchText = ref("");

const folderMock = ref<FolderType[]>([
    {
        uuid: uuid(),
        name: "Folder Name",
        lastModified: new Date().toISOString(),
        size: 129472784
    },
    {
        uuid: uuid(),
        name: "Very long folder 2 name this is Very long folder 2 name this is Very long folder 2 name this is Very long folder 2 name this is",
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

const fileMock = ref<FileType[]>([
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
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?8",
        size: 18273
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?9",
        size: 18273
    },
    {
        uuid: uuid(),
        name: "Medieval Critical Reading",
        lastModified: new Date().toISOString(),
        preview: "https://picsum.photos/248/178?10",
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

// FOLDER

const showFolder = ref(true)
const folder = useTemplateRef<HTMLDivElement>("folder")

function syncFolderHeight() {
    if (!folder.value) {
        return
    }

    const oldHeight = folder.value.style.height
    folder.value.style.height = "auto"
    const { height } = folder.value.getBoundingClientRect()
    folder.value.style.height = oldHeight
    requestAnimationFrame(() => {
        if (folder.value) {
            folder.value.style.height = `${height + 5}px`
        }
    })
}

function toggleFolders() {
    showFolder.value = !showFolder.value

    if (showFolder.value) {
        syncFolderHeight()
    } else if (folder.value) {
        folder.value.style.height = "0"
    }
}

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

// SETTING SYNC

const route = useRoute()
const router = useRouter()

const options = reactive<DocumentOptions>({
    view: "icon",
    sortBy: "date",
    order: "ascending"
})

function syncOptions() {
    // does not allow list view when no file and folder exist
    if (route.query.view && ["icon", "list"].includes(route.query.view as string) && aggregatedFiles.value.length) {
        options.view = route.query.view as "icon" | "list"
    }

    if (route.query.sortBy && ["date", "name", "size"].includes(route.query.sortBy as string)) {
        options.sortBy = route.query.sortBy as "date" | "name" | "size"
    }

    if (route.query.order && ["ascending", "descending"].includes(route.query.order as string)) {
        options.order = route.query.order as "ascending" | "descending"
    }

    pushOptions()
}

function pushOptions() {
    router.push({
        path: route.path,
        query: options
    })
}

// HOOKS

onMounted(() => {
    syncOptions()
    syncFolderHeight()
    alignRaf()
})

watch(options, pushOptions)
watch(folder, syncFolderHeight)
</script>

<template>
    <SeoHead title="Documents"/>

    <DashboardFrame activate="/document" class="flex-grow min-h-0">
        <template #nav>
            <DashboardNav search v-model:text="searchText"/>
        </template>

        <ContextMenu class="flex flex-col px-8 mb-8">
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

            <div class="flex justify-between items-center my-6">
                <span class="font-medium text-xl pt-1 tracking-[-3%]">Document</span>
                <NuxtLink class="rounded bg-[#C54C4429] flex items-center px-4 py-3 gap-3 cursor-pointer border border-transparent
                            hover:bg-transparent hover:border-primary hover:text-primary transition"
                          to="/analytic">
                    <UploadIcon class="w-5" />
                    <span class="font-semibold text-md tracking-[-3%]">Upload Document</span>
                </NuxtLink>
            </div>
            <hr class="m-0"/>

            <template v-if="options.view === 'icon'">
                <div class="w-full mt-8 overflow-hidden flex-shrink-0" v-if="folderMock.length">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex gap-4 items-center">
                            <span class="text-2xl">My folders</span>
                            <el-icon class="cursor-pointer transition-all" :class="{'rotate-180': !showFolder}" @click="toggleFolders">
                                <el-icon-caret-bottom/>
                            </el-icon>
                        </div>
                        <DocumentViewOptions v-model="options" />
                    </div>
                    <div class="grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 transition-all duration-500 gap-4 items-start" ref="folder">
                        <Folder v-for="folder in folderMock" :key="folder.uuid"
                                :name="folder.name" :last-modified="folder.lastModified"/>
                    </div>
                </div>
                <div class="w-full my-8 flex flex-col gap-4 flex-shrink-0" v-if="fileMock.length">
                    <span class="text-2xl">My files</span>
                    <div class="grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                        <File v-for="file in fileMock" :key="file.uuid"
                              :name="file.name" :last-modified="file.lastModified" :preview="file.preview" />
                    </div>
                </div>
                <div v-else class="w-full h-full flex justify-center items-center">
                    <div class="flex flex-col justify-center items-center max-w-[400px] mb-36">
                        <img src="/no_document.png" alt="No documents found" class="w-[320px] mr-6" />
                        <h2 class="text-2xl -mt-12 mb-4">No documents found</h2>
                        <span class="text-center text-[#5d5d5d] tracking-[-3%]">You haven’t created or uploaded any documents. Start by adding your first one now.</span>
                    </div>
                </div>
            </template>
            <DocumentTable v-model="options" :aggregated-files="aggregatedFiles" v-else></DocumentTable>
        </ContextMenu>
    </DashboardFrame>
</template>

<style scoped>

</style>