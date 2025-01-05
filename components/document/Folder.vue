<script setup lang="ts">
import { useTime } from "~/composibles/useTime";
import FolderIcon from "~/components/svg/FolderIcon.vue";
import OpenIcon from "~/components/svg/OpenIcon.vue";
import RenameIcon from "~/components/svg/RenameIcon.vue";
import CopyIcon from "~/components/svg/CopyIcon.vue";
import DeleteIcon from "~/components/svg/DeleteIcon.vue";
import DropDown from "~/components/general/DropDown.vue";
import ContextMenu from "~/components/general/ContextMenu.vue";
import MenuFrame from "~/components/general/MenuFrame.vue";
import MenuEntry from "~/components/general/MenuEntry.vue";
import useEventBus from "~/composibles/useEventBus";

defineProps<{
    name: string,
    lastModified: string,
}>();

const { makeDate } = useTime()
const showDots = ref(false)

const menuOptions: ContextMenuEntry[] = [
    {
        icon: OpenIcon,
        text: "Open in new tab",
    },
    {
        icon: RenameIcon,
        text: "Rename",
        divided: true
    },
    {
        icon: CopyIcon,
        text: "Copy",
    },
    {
        icon: DeleteIcon,
        text: "Delete"
    }
]

const eventBus = useEventBus()

function menuOff() {
    eventBus.emit("context-menu-off")
}
</script>

<template>
    <ContextMenu>
        <template #menu>
            <MenuFrame>
                <MenuEntry v-for="entry in menuOptions" :key="entry.text" :divided="entry.divided">
                    <template #icon>
                        <component :is="entry.icon" class="w-[1.2em] h-[1.2em]" />
                    </template>
                    <span>{{entry.text}}</span>
                </MenuEntry>
            </MenuFrame>
        </template>
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
                <el-icon class="rotate-90" @mouseenter="menuOff">
                    <el-icon-more-filled class="text-emphasis" />
                </el-icon>
                <template #dropdown>
                    <el-dropdown-menu @mouseenter="showDots = true" @mouseleave="showDots = false">
                        <el-dropdown-item v-for="item in menuOptions" :key="item.text"
                                          :divided="item.divided" :icon="item.icon" @click="item.callback">
                            {{item.text}}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </DropDown>
        </div>
    </ContextMenu>
</template>

<style scoped>

</style>