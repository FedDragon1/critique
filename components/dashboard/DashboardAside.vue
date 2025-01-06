<script setup lang="ts">
import DashboardIcon from "~/components/svg/DashboardIcon.vue";
import NewScan from "~/components/svg/NewScan.vue";
import SettingsIcon from "~/components/svg/SettingsIcon.vue";
import DocumentIcon from "~/components/svg/DocumentIcon.vue";
import BrandIcon from "~/components/svg/BrandIcon.vue";

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

defineProps<{
    activate: "/dashboard" | "/analytic" | "/dashboard/profile" | "/setting" | "/document",
}>();
</script>

<template>
    <aside class="w-[90px] border-r box-border flex-shrink-0 overflow-hidden relative bg-[#F6F6F6]">
        <div class="h-nav w-full flex justify-around items-center absolute">
            <NuxtLink to="/dashboard">
                <BrandIcon :height="32" class="flex-shrink-0 pt-2"></BrandIcon>
            </NuxtLink>
        </div>
        <div class="p-2.5 flex flex-col justify-center h-full">
            <div class="flex flex-col gap-1 mt-2 items-center">
                <template v-for="route in routes" :key="route.to">
                    <NuxtLink
                        class="justify-center flex-col gap-1 h-14 my-1 function-tab flex w-full text-zinc-500 items-center rounded cursor-pointer box-border whitespace-nowrap"
                        :to="route.to" :class="{ 'bg-primary-translucent': activate === route.to }">
                        <component :is="route.component"
                                   width="20"
                                   height="20"
                                   class="aspect-square h-5 inline-block align-baseline flex-shrink-0"
                                   :fill="activate === route.to ? '#0D062D' : '#909399'"></component>
                        <span class="text-[0.7rem]" :class="{ 'text-emphasis': activate === route.to }">
                            {{ route.caption }}
                        </span>
                    </NuxtLink>
                </template>
            </div>
        </div>
    </aside>
</template>

<style scoped>
</style>