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
    activate: "/dashboard" | "/analytic" | "/dashboard/profile" | "/setting" | "/document",
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
    <aside class="w-[250px] border-r flex flex-col box-border flex-shrink-0 overflow-hidden transition-all duration-300 bg-[#F6F6F6]"
           :class="{'w-[90px]': uiStore.minimized}">
        <div class="h-nav flex justify-around items-center flex-shrink-0" :class="{ 'border-b': !uiStore.minimized }">
            <NuxtLink to="/dashboard">
                <BrandIcon :height="32" v-if="uiStore.minimized" class="flex-shrink-0 pt-2"></BrandIcon>
                <BrandIconLight :height="32" v-else class="pt-2 flex-shrink-0"></BrandIconLight>
            </NuxtLink>
            <MinimizeIcon width="24" height="24" fill="#909399" @click="toggle" v-if="!uiStore.minimized" class="-translate-x-0.5 translate-y-1 flex-shrink-0" />
        </div>
        <div class="p-2.5 transition-all duration-300 flex flex-col justify-center" :class="[uiStore.minimized ? ' flex-grow' : 'flex-grow-0' ]">
            <div class="flex flex-col gap-1 mt-2 items-center">
                <MinimizeIcon width="24" height="24" fill="#909399" @click="toggle" class="rotate-180 mb-2" v-if="uiStore.minimized"/>
                <template v-for="route in routes" :key="route.to">
                    <NuxtLink class="function-tab flex w-full text-zinc-500 items-center rounded cursor-pointer box-border whitespace-nowrap"
                              :to="route.to" :class="{
                                  'bg-primary-translucent': activate === route.to,
                                  'pl-4 gap-2.5 h-12': !uiStore.minimized,
                                  'justify-center flex-col gap-1 h-14 my-1': uiStore.minimized}">
                        <component :is="route.component"
                                   width="20"
                                   height="20"
                                   class="aspect-square h-5 inline-block align-baseline flex-shrink-0"
                                   :fill="activate === route.to ? '#0D062D' : '#909399'"></component>
                        <span :class="{ 'text-[0.7rem]': uiStore.minimized,
                                      'font-medium': !uiStore.minimized && activate === route.to,
                                      'text-emphasis': activate === route.to}">
                            {{ route.caption }}
                        </span>
                    </NuxtLink>
                </template>
            </div>
            <hr class="border-0 border-b" v-if="!uiStore.minimized">
            <div class="px-2.5 text-zinc-500 whitespace-nowrap" v-if="!uiStore.minimized">
                <div class="flex justify-between items-center mb-4">
                    <span class="uppercase font-bold text-sm">recent projects</span>
                    <NewScan width="24" fill="#909399" height="24" />
                </div>
                <div v-for="item in mockProjects" :key="item.uuid"
                     class="w-full flex items-center gap-4 h-8 my-3 pl-1 cursor-pointer">
                    <div class="h-2 w-2 rounded-full flex-shrink-0" :style="{ background: item.color }"></div>
                    <span class="text-ellipsis whitespace-nowrap overflow-hidden flex-grow text-sm" :title="item.name">{{item.name}}</span>
                </div>
            </div>
        </div>
    </aside>
</template>

<style scoped>
</style>