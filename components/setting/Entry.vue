<script setup lang="ts">
import EntryHeader from "~/components/setting/EntryHeader.vue";
import EntryValue from "~/components/setting/EntryValue.vue";

defineProps<{
    borderTop?: boolean,
    borderBottom?: boolean,
    heading: string,
    value?: string,
}>()
</script>

<template>
    <hr class="m-0" v-if="borderTop ?? true" />
    <div class="flex justify-between items-center py-6 h-28">
        <div class="flex flex-col gap-2">
            <EntryHeader>{{ heading }}</EntryHeader>
            <EntryValue v-if="value !== undefined">{{ value }}</EntryValue>
        </div>
        <slot />
    </div>
    <hr class="m-0" v-if="borderBottom" />
</template>

<style scoped>

</style>