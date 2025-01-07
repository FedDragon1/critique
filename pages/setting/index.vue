<script setup lang="ts">
import SectionHeader from "~/components/setting/SectionHeader.vue";
import Entry from "~/components/setting/Entry.vue";
import LinkAction from "~/components/setting/LinkAction.vue";
import DangerAction from "~/components/setting/DangerAction.vue";
import SwitchAction from "~/components/setting/SwitchAction.vue";
import UserIcon from "~/components/svg/UserIcon.vue";
import SettingsIcon from "~/components/svg/SettingsIcon.vue";
import BellIcon from "~/components/svg/BellIcon.vue";
import BillingIcon from "~/components/svg/BillingIcon.vue";
import _ from "lodash";

definePageMeta({
    middleware: 'auth'
})

const userStore = useUserStore();
const userInfo = await userStore.getUserInfo

const settingData: SettingEntry[] = [
    {
        id: "account",
        heading: "Manage Account",
        icon: UserIcon,
        sections: [
            {
                heading: "Username",
                value: userInfo?.displayName,
                actionComponent: LinkAction,
                actionSlot: "Change",
            },
            {
                heading: "Email Address",
                value: userInfo?.email,
                actionComponent: LinkAction,
                actionSlot: "Copy",
                borderBottom: true,
            }
        ]
    },
    {
        id: "security",
        heading: "Security & Privacy",
        icon: SettingsIcon,
        sections: [
            {
                heading: "Change Password",
                value: "Last changed 2 months ago",
                actionComponent: LinkAction,
                actionSlot: "Change"
            },
            {
                heading: "Logged in with",
                value: `Google Account: ${userInfo?.email}`
            },
            {
                heading: "Deactivate your account",
                actionComponent: DangerAction,
                actionSlot: "Deactivate",
                borderBottom: true,
            }
        ]
    },
    {
        id: "notification",
        heading: "Notifications",
        icon: BellIcon,
        sections: [
            {
                heading: "AI Processing Status",
                value: "Notify me when document analysis fails / completes",
                actionComponent: SwitchAction,
                actionClick: (to: boolean) => updateSetting("processing-status", to),
            },
            {
                heading: "User Action Required Notification",
                value: "Remind me to review or confirm AI annotations",
                actionComponent: SwitchAction,
                actionClick: (to: boolean) => updateSetting("user-action", to),
            },
            {
                heading: "System Updates",
                value: "Notify me about new features and updates",
                actionComponent: SwitchAction,
                actionClick: (to: boolean) => updateSetting("system-update", to),
            },
            {
                heading: "Announcements",
                value: "Notify me about scheduled maintenance or downtime",
                actionComponent: SwitchAction,
                actionClick: (to: boolean) => updateSetting("announcement", to),
            },
            {
                heading: "Achievements & Milestones",
                value: "Celebrate my document processing milestones",
                actionComponent: SwitchAction,
                actionClick: (to: boolean) => updateSetting("milestone", to),
                borderBottom: true
            }
        ]
    },
    {
        id: "billing",
        heading: "Billing & Plans",
        icon: BillingIcon,
        sections: []
    }
]

const active = ref(settingData[0].id)

function scrollTo(id: string) {
    const elementById = document.getElementById(id);

    if (!elementById) {
        return
    }

    elementById.scrollIntoView({
        behavior: "smooth"
    })
    active.value = id
}

function syncTocRaw() {
    const scroller = document.getElementById("scroll-frame")
    const pages = settingData.map(data => document.getElementById(data.id))

    if (!scroller || !pages.reduce((a, b) => a && b)) {
        return
    }

    const targetHeight = scroller.scrollTop
    let height = 0

    for (let i = 0; i < pages.length; i++) {
        height += pages[i]!.offsetHeight
        if (height > targetHeight) {
            active.value = pages[i]!.id
            return
        }
    }
}

function updateSetting(settingId: SettingId, to: boolean) {
    ElMessage.info(`Updating ${settingId} to ${to}`)
}

const syncToc = _.throttle(syncTocRaw, 100)

onMounted(() => {
    const scroller = document.getElementById("scroll-frame")
    if (!scroller) {
        return
    }
    scroller.addEventListener("scroll", syncToc)
})

onBeforeUnmount(() => {
    const scroller = document.getElementById("scroll-frame")
    if (!scroller) {
        return
    }
    scroller.removeEventListener("scroll", syncToc)
})
</script>

<template>
    <SeoHead title="Settings" />

    <DashboardFrame activate="/setting" class="flex justify-center mt-4 gap-8" id="scroll-frame">
        <template #nav>
            <DashboardNav />
        </template>
        <div class="w-[220px] sticky top-0 flex flex-col gap-2 pt-6">
            <div v-for="entry in settingData" :key="entry.id"
                 class="flex cursor-pointer gap-3 p-2 items-center rounded-lg hover:bg-[#ededed] transition"
                 :class="{ 'bg-[#ededed]': active === entry.id }"
                 @click="() => scrollTo(entry.id)">
                <component :is="entry.icon" width="20" height="20" fill="#24292F" />
                <span>{{ entry.heading }}</span>
            </div>
            <div>

            </div>
        </div>
        <div class="max-w-[800px] w-3/5 relative">
            <div v-for="(entry, i) in settingData" :key="entry.id" :id="entry.id"
                 :class="{ 'min-h-full': i === settingData.length - 1 }">
                <SectionHeader>{{ entry.heading }}</SectionHeader>
                <Entry v-for="section in entry.sections" :key="section.heading" :heading="section.heading"
                       :border-bottom="section.borderBottom" :border-top="section.borderTop" :value="section.value">
                    <component v-if="section.actionComponent" :is="section.actionComponent" @click="section.actionClick">
                        <template #default v-if="section.actionSlot">
                            {{ section.actionSlot }}
                        </template>
                    </component>
                </Entry>
            </div>
        </div>
    </DashboardFrame>
</template>

<style scoped>

</style>