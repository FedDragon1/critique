<script setup lang="ts">
import BrandIconLight from "~/components/svg/BrandIconLight.vue";
import DashboardIcon from "~/components/svg/DashboardIcon.vue";
import NewScan from "~/components/svg/NewScan.vue";
import SettingsIcon from "~/components/svg/SettingsIcon.vue";
import DocumentIcon from "~/components/svg/DocumentIcon.vue";
import BrandIcon from "~/components/svg/BrandIcon.vue";
import MinimizeIcon from "~/components/svg/MinimizeIcon.vue";
import { useUiStore } from "~/stores/uiOptionStore";

const routes = [
    {
        to: "/analytic",
        component: NewScan,
        caption: "New Scan"
    },
    {
        to: "/dashboard",
        component: DashboardIcon,
        caption: "Dashboard"
    },
    {
        to: "/document",
        component: DocumentIcon,
        caption: "Documents"
    },
    {
        to: "/setting",
        component: SettingsIcon,
        caption: "Settings"
    },
]

const props = defineProps<{
    activate: "/dashboard" | "/analytic" | "/dashboard/profile" | "/setting",
    postToggle?: () => void
}>();

const uiStore = useUiStore()

function toggle() {
    uiStore.toggleNav();
    props.postToggle && props.postToggle()
}

const mockProjects = [
    {
        color: "#79c354",
        name: "Medieval Critical Read",
        uuid: "asdklfja"
    },
    {
        color: "#fda400",
        name: "Great Depression Critical Read",
        uuid: "aasdf"
    },
    {
        color: "#e2cafb",
        name: "Fascism Critical Read",
        uuid: "dfgfgdfg"
    },
    {
        color: "#75a4e8",
        name: "Shakespeare Analysis",
        uuid: "o;sdfiugpo"
    },
]
</script>

<template>
    <aside class="w-[250px] border-r flex flex-col box-border flex-shrink-0 overflow-hidden transition-all bg-[#F6F6F6]"
           :class="{'dashboard-aside-minimized': uiStore.minimized}">
        <div class="h-nav border-b flex justify-around items-center flex-shrink-0">
            <BrandIcon :height="40" v-if="uiStore.minimized" @click="toggle" style="padding-top: 16px; flex-shrink: 0"></BrandIcon>
            <template v-else>
                <NuxtLink to="/dashboard">
                    <BrandIconLight :height="36" style="padding-top: 16px; flex-shrink: 0"></BrandIconLight>
                </NuxtLink>
                <MinimizeIcon width="24" height="24" fill="#909399" @click="toggle" style="translate: -2px 4px; flex-shrink: 0" />
            </template>
        </div>
        <div class="p-2.5">
            <div class="flex flex-col gap-2.5 my-4">
                <template v-for="route in routes" :key="route.to">
                    <NuxtLink class="function-tab flex w-full gap-2.5 h-12 text-zinc-500 items-center rounded cursor-pointer pl-4 box-border"
                              :to="route.to" :class="{'bg-primary-translucent': activate === route.to}">
                        <component :is="route.component"
                                   width="20"
                                   height="20"
                                   class="aspect-square h-5 inline-block align-baseline"
                                   :fill="activate === route.to ? '#000000' : '#909399'"></component>
                        <span v-if="!uiStore.minimized" :class="{'text-foreground': activate === route.to}">{{ route.caption }}</span>
                    </NuxtLink>
                </template>
            </div>
            <hr class="border-0 border-b">
            <div class="px-2.5 text-zinc-500">
                <div class="flex justify-between items-center">
                    <span class="uppercase font-bold text-sm">recent projects</span>
                    <NewScan width="24" fill="#909399" height="24" />
                </div>
                <div v-for="item in mockProjects" :key="item.uuid"
                     class="w-full flex items-center gap-4 h-8 my-4">
                    <div class="h-2 w-2 rounded-full flex-shrink-0" :style="{ background: item.color }"></div>
                    <span class="text-ellipsis whitespace-nowrap overflow-hidden flex-grow" :title="item.name">{{item.name}}</span>
                </div>
            </div>
        </div>
    </aside>
</template>

<style scoped>

.dashboard-aside-minimized {
    width: var(--aside-width-minimized);
}

.dashboard-aside-minimized .function-tab {
    padding-right: 10px;
}
</style>