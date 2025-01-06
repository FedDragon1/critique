<script setup lang="ts">
import { Check } from "@element-plus/icons-vue";
import EmptyIcon from "~/components/general/EmptyIcon.vue";

defineProps<{
    entry: string,
    value: string,
}>()

const model = defineModel<Record<string, string>>()
const attrs = useAttrs()
</script>

<template>
    <el-dropdown-item :icon="model![entry] === value ? Check : EmptyIcon"
                      class="!text-sm !pr-8 !gap-1"
                      @click.prevent="model![entry] = value" v-bind="attrs">
        <slot />
    </el-dropdown-item>
</template>

<style scoped>
</style>