<script setup lang="ts">
import SpinningLoading from "~/components/svg/SpinningLoading.vue";
import {cacheOfPromises} from "~/composibles/useTiptapEditor";

const props = defineProps<{
    segmentId: string,
}>();
const emit = defineEmits(["fix"])

const fullFilled = ref(false)
const display = ref("")

const universalId = computed(() => props.segmentId.split("-").slice(0, -1).join("-"))

let promise = cacheOfPromises.get(universalId.value)

const refreshPromise = () => {
    promise = cacheOfPromises.get(universalId.value)
    if (promise) {
        promise?.then((v) => {
            fullFilled.value = true
            display.value = v
        })
    } else {
        setTimeout(refreshPromise, 100)
    }
}

if (!promise) {
    setTimeout(refreshPromise, 100)
}

watch(() => [props.segmentId], () => {
    fullFilled.value = false
    refreshPromise()
})

function fix() {
    if (fullFilled.value) {
        emit("fix", display.value)
    }
}
</script>

<template>
    <el-icon size="0.875rem" @click="fix"><el-icon-circle-check/></el-icon>
    <span @click="fix">Correct to</span>
    <SpinningLoading @click="fix" v-if="!fullFilled"></SpinningLoading>
    <b v-else @click="fix">{{ display }}</b>
</template>

<style scoped>
b {
    max-width: 300px;
    overflow-x: auto;
}
</style>