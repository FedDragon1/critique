<script setup lang="ts">
import RecentFilePreview from "~/components/dashboard/RecentFilePreview.vue";
import { useTime } from "~/composibles/useTime";
import FileList from "~/components/dashboard/FileList.vue";
import type { BaseResponse, DeleteFileRequest, UpdateFileRequest } from "~/types/requests";
import { throttle } from "lodash-es";
import DashboardNav from "~/components/dashboard/DashboardNav.vue"
import { v4 as uuid } from 'uuid'
import BugIcon from "~/components/svg/BugIcon.vue";
import HeadIcon from "~/components/svg/HeadIcon.vue";
import BellIcon from "~/components/svg/BellIcon.vue";
import MedalIcon from "~/components/svg/MedalIcon.vue";
import { Chart, registerables } from "chart.js";

definePageMeta({
    middleware: 'auth'
})

const client = useSupabaseClient()
const userStore = useUserStore();
const userAvatar = await userStore.getUserAvatar(client)
const userName = (await userStore.getUserInfo)?.displayName

const searchText = ref("");
const deletingFileUuid = ref<string>("")
const deletingFile = computed(
    () => recentFiles?.data?.filter(f => f.uuid === deletingFileUuid.value)[0])
const isDeletingFile = computed(() => deletingFileUuid.value !== "")

const renamingFileUuid = ref<string>("")
const renamingFile = computed(
    () => recentFiles?.data?.filter(f => f.uuid === renamingFileUuid.value)[0])
const isRenamingFile = computed(() => renamingFileUuid.value !== "")
const renamingError = ref("")
const renamingTo = ref("")

const router = useRouter()
const { makeDate } = useTime();

const recentFiles = (await useFetch<BaseResponse<CritiqueFull[]>>("/api/file/recent")).data.value

function favoriteRaw(uuid: string) {
    if (!recentFiles?.data) {
        ElMessage.error("No files")
        return;
    }

    const request: UpdateFileRequest = {
        uuid,
        favorite: true
    }
    $fetch<BaseResponse<Critique>>("/api/file", {
        method: "PUT",
        body: request
    }).then(resp => {
        if (!recentFiles?.data) {
            ElMessage.error("No files")
            return;
        }
        if (!resp.success) {
            ElMessage.error(resp.errorMessage)
            return;
        }
        ElMessage.success({
            message: `Added "${resp.data?.fileName}" to favorite`,
            grouping: true
        })
        recentFiles.data.filter(f => f.uuid === uuid)[0].isFavorite = true
    })
}

function unfavoriteRaw(uuid: string) {
    const request: UpdateFileRequest = {
        uuid,
        favorite: false
    }
    $fetch<BaseResponse<Critique>>("/api/file", {
        method: "PUT",
        body: request
    }).then(resp => {
        if (!recentFiles?.data) {
            ElMessage.error("No files")
            return;
        }
        if (!resp.success) {
            ElMessage.error(resp.errorMessage)
            return;
        }
        ElMessage.success({
            message: `Removed "${resp.data?.fileName}" from favorite`,
            grouping: true
        })
        recentFiles.data.filter(f => f.uuid === uuid)[0].isFavorite = false
    })
}

function deleteFileRaw() {
    if (!recentFiles?.data) {
        ElMessage.error("No files")
        return;
    }

    const request: DeleteFileRequest = {
        uuids: [deletingFileUuid.value]
    }
    $fetch<BaseResponse<Critique>>("/api/file", {
        method: "DELETE",
        body: request
    }).then(resp => {
        if (!recentFiles?.data) {
            ElMessage.error("No files")
            return;
        }
        if (!resp.success) {
            ElMessage.error(resp.errorMessage)
            return;
        }
        // @ts-ignore
        ElMessage.success(`Deleted file "${resp.data[0].fileName}"`)
        recentFiles.data = recentFiles.data.filter(f => f.uuid !== deletingFileUuid.value)
        deletingFileUuid.value = "";
    })
}

function resetRenaming() {
    renamingFileUuid.value = ""
    renamingError.value = ""
    renamingTo.value = ""
}

function renameFileRaw() {
    if (!recentFiles?.data) {
        ElMessage.error("No files")
        return;
    }

    const newName = renamingTo.value.trim()

    if (newName.length === 0) {
        renamingError.value = "File name cannot be empty!"
        return;
    }
    if (newName.length > 20) {
        renamingError.value = ("File name cannot be longer than 20 characters")
        return;
    }
    if (newName.match(/[^A-Za-z0-9_\- ]/)) {
        renamingError.value = ("File name can only contain A-Z, a-z, 0-9, _, -, and whitespace")
        return;
    }

    const request: UpdateFileRequest = {
        uuid: renamingFileUuid.value,
        fileName: renamingTo.value,
        modifiedAt: new Date().toISOString()
    }
    $fetch<BaseResponse<Critique>>("/api/file", {
        method: "PUT",
        body: request
    }).then(resp => {
        if (!recentFiles?.data) {
            ElMessage.error("No files")
            return;
        }
        if (!resp.success) {
            ElMessage.error(resp.errorMessage)
            return;
        }
        ElMessage.success(`Renamed to "${renamingTo.value}"`)
        recentFiles.data.filter(f => f.uuid === renamingFileUuid.value)[0].fileName = renamingTo.value;
        resetRenaming()
    })
}

const deleteFile = throttle(deleteFileRaw, 2000)
const renameFile = throttle(renameFileRaw, 2000)
const unfavorite = throttle(unfavoriteRaw, 2000)
const favorite = throttle(favoriteRaw, 2000)

const notificationsMock = [
    {
        uuid: uuid(),
        type: "failure",
        title: `Analysis failed for "Fascism Critical Read".`,
        timestamp: new Date().toISOString()
    },
    {
        uuid: uuid(),
        type: "review",
        title: `We need your review on "Shakespeare Analysis".`,
        timestamp: "2024-12-31T19:30:00.000Z"
    },
    {
        uuid: uuid(),
        type: "announcement",
        title: "A new version of Critique is now available.",
        timestamp: "2024-12-30T19:30:00.000Z"
    },
    {
        uuid: uuid(),
        type: "achievement",
        title: "Your 50th critical read on Critique!",
        timestamp: "2024-12-30T19:30:00.000Z"
    }
]

const notificationIcon: { [key in string]: typeof BugIcon } = {
    "failure": BugIcon,
    "review": HeadIcon,
    "announcement": BellIcon,
    "achievement": MedalIcon
}

const notificationColor: { [key in string]: string } = {
    "failure": "#fcedfc",
    "review": "#E6F1FD",
    "announcement": "#EDEEFC",
    "achievement": "#fceded"
}

function capitalizeFirst(s: string) {
    return s.slice(0, 1).toUpperCase() + s.slice(1)
}

// test

function randomArray(length: number) {
    const arr = []
    for (let i = 0; i < length; i++) {
        arr.push(Math.floor(Math.random() * 5))
    }
    return arr
}

Chart.register(...registerables);

const labels = {
    week: ["S", "M", "T", "W", "T", "F", "S"],
    month: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    year: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

let chartInstance: Chart
const chartRef = ref<HTMLCanvasElement>()
const selectedRange = ref<keyof typeof labels>("week")

const data = {
    week: randomArray(7),
    month: randomArray(30),
    year: randomArray(12),
};

const scale = 0.85

const createChart = () => {
    const canvas = chartRef.value
    if (!canvas) {
        setTimeout(createChart, 1000);
        return
    }

    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        setTimeout(createChart, 1000)
        return
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels[selectedRange.value],
            datasets: [
                {
                    label: "Activity",
                    data: data[selectedRange.value],
                    borderColor: "#000000",
                    pointBorderColor: "#D47A74",
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBorderWidth: 3,
                    pointBackgroundColor: "#FFFFFF",
                    tension: 0.6, // Smooth curve
                    clip: false,
                },
                {
                    label: "shadow",
                    data: data[selectedRange.value].map(i => i * scale),
                    borderColor: "#F5F5F7",
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: 0.6, // Smooth curve
                    clip: false,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: (context) => {
                            if (context.raw === 1) {
                                return "1 Scan"
                            }
                            return `${context.raw as number} Scans`
                        },
                        title: () => ""
                    },
                    filter: (item) => {
                        return item.dataset.label !== "shadow";
                    },
                    yAlign: "bottom",
                    displayColors: false,
                    mode: "nearest",
                    intersect: true,
                    caretPadding: 10,
                    padding: {
                        top: 15,
                        bottom: 15,
                        left: 20,
                        right: 20
                    },
                    backgroundColor: "#000000",
                    bodyFont: {
                        weight: 500,
                        family: "Inter",
                        size: 14
                    }
                },
                legend: {
                    display: false
                },
            },
            interaction: {
                mode: "nearest",
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        drawOnChartArea: true,
                        drawTicks: true,
                        color: "#F5F5F7",
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        padding: 10,
                        color: "#000000",
                        font: {
                            weight: 500,
                            family: "Inter"
                        }
                    },
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        stepSize: 1,
                        padding: 20,
                        color: "#000000",
                        callback(value) {
                            return Math.round(Number(value))
                        },
                        font: {
                            weight: 500,
                            family: "Inter"
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                        drawTicks: false,
                    },
                    border: {
                        display: false
                    },
                    suggestedMax: Math.max(...data[selectedRange.value]) + 1
                },
            }
        },
    });
};

const updateChart = () => {
    chartInstance.data.labels = labels[selectedRange.value];
    chartInstance.data.datasets[0].data = data[selectedRange.value];
    chartInstance.data.datasets[1].data = data[selectedRange.value].map(i => i * scale);
    chartInstance.update();
};

onMounted(() => {
    createChart();
});
</script>

<template>
    <SeoHead title="Dashboard"/>

    <el-dialog
        v-model="isDeletingFile"
        title="Warning"
        width="500"
        :before-close="() => deletingFileUuid = ''"
    >
        <template v-if="deletingFile">
            <span>Are you sure you want to delete "{{ deletingFile.fileName }}"?</span>
            <br>
            <span>You cannot undo this operation.</span>
        </template>
        <template v-else>
            Operation complete.
        </template>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="deletingFileUuid = ''">Cancel</el-button>
                <el-button type="primary" @click="deleteFile">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog>
    <el-dialog
        v-model="isRenamingFile"
        title="Edit"
        width="500"
        :before-close="resetRenaming"
    >
        <template v-if="renamingFile">
            <span style="line-height: 2rem">Renaming "{{ renamingFile.fileName }}" to</span>
            <br>
            <el-input
                maxlength="50"
                placeholder="New file name"
                v-model="renamingTo"></el-input>
            <el-text type="danger">{{ renamingError }}</el-text>
        </template>
        <template v-else>
            Operation complete.
        </template>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="renamingFileUuid = ''">Cancel</el-button>
                <el-button type="primary" @click="renameFile()">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog>

    <DashboardFrame activate="/dashboard" class="gap-10 flex flex-col p-12">
        <template #nav>
            <DashboardNav v-model:text="searchText" :user-avatar="userAvatar"/>
        </template>

        <div class="w-full flex gap-12 h-[320px]">
            <div class="flex flex-col h-full justify-between">
                <div class="p-4">
                    <h1 class="font-medium text-2xl mt-8 mb-2">Hi, {{ userName }}</h1>
                    <h3 class="text-[#54577A] text-lg">Let us simplify your reading journey.</h3>
                </div>
                <NuxtLink to="/analytic" class="flex rounded-lg p-8 w-[400px] items-center gap-5 transition-all
                              duration-200 shadow-sm bg-white hover:shadow">
                    <img class="w-12 h-12"
                         src="data:image/png;base64,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"
                         alt="new file">
                    <div class="flex flex-col gap-1">
                        <span>New File</span>
                        <span class="description-text">Critical Thinking and Analysis</span>
                    </div>
                </NuxtLink>
            </div>
            <div class="flex-grow min-w-[500px] bg-white shadow-sm hover:shadow h-full p-6 flex flex-col gap-2 rounded transition-all">
                <div class="flex w-full justify-around items-center mb-4">
                    <h1 class="text-xl w-full">Activity</h1>
                    <select v-model="selectedRange" @change="updateChart">
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
                <canvas ref="chartRef" class="flex-grow flex-1 min-h-0 w-full"></canvas>
            </div>
            <div class="w-[400px] min-w-[200px] bg-white shadow-sm rounded p-6 flex flex-col gap-2 items-center transition-all hover:shadow">
                <h1 class="text-xl w-full mb-4">Notifications</h1>
                <div class="flex flex-col flex-grow gap-4 w-full">
                    <div v-for="notif in notificationsMock.slice(0, 3)" :key="notif.uuid"
                         class="w-full flex gap-4 cursor-pointer">
                        <div class="w-10 h-10 flex justify-center items-center rounded-xl flex-shrink-0"
                             :style="{ background: notificationColor[notif.type] }">
                            <component :is="notificationIcon[notif.type]"
                                       width="24px"
                                       height="24px"
                                       fill="#000000" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="overflow-ellipsis whitespace-nowrap overflow-hidden"
                                :title="notif.title">{{ notif.title }}</h3>
                            <span class="text-sm text-zinc-500">{{ capitalizeFirst(makeDate(notif.timestamp)) }}</span>
                        </div>
                    </div>
                </div>
                <a class="underline cursor-pointer">View all</a>
            </div>
        </div>


        <div class="recent-files">
            <h3 class="subheading">Recent Files</h3>
            <div class="recent-file-display">
                <RecentFilePreview
                    v-if="recentFiles?.success"
                    v-for="file of recentFiles?.data?.slice(0, 3)"
                    @delete="uuid => deletingFileUuid = uuid"
                    @favorite="favorite"
                    @unfavorite="unfavorite"
                    @rename="uuid => renamingFileUuid = uuid"
                    @click="router.push(`/analytic/${file.uuid}`)"
                    :uuid="file.uuid"
                    :key="file.uuid"
                    :file-name="file.fileName"
                    :last-modified="makeDate(file.lastModified)"
                    :preview-image="file.previewLink"
                    :is-favorite="file.isFavorite"></RecentFilePreview>
                <RecentFilePreview
                    v-for="i in Math.max(3 - (recentFiles?.data?.length ?? 0), 0)"
                    file-name="It is empty here."
                    last-modified="--"
                    preview-image=""
                    :is-favorite="false"
                    :key="i"
                    :uuid="i.toString()"
                    disable-ops>
                    <span class="secondary">It is empty here.</span>
                </RecentFilePreview>
            </div>
        </div>

        <div class="file-list">
            <FileList
                v-if="recentFiles?.success"
                @unfavorite="unfavorite"
                @favorite="favorite"
                @delete="uuid => deletingFileUuid = uuid"
                @rename="uuid => renamingFileUuid = uuid"
                :files="recentFiles?.data ?? []"></FileList>
        </div>
    </DashboardFrame>
</template>

<style scoped>
.recent-file-display {
    display: flex;
    gap: 20px;
}

.subheading {
    margin-top: 0;
    margin-left: var(--el-border-radius-round);
}
</style>