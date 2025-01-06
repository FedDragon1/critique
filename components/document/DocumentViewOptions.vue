<script setup lang="ts">

import SelectEntry from "~/components/general/SelectEntry.vue";
import TweakingIcon from "~/components/svg/TweakingIcon.vue";
import DropDown from "~/components/general/DropDown.vue";
import SelectGroup from "~/components/general/SelectGroup.vue";

const options = defineModel<Record<string, string>>()
</script>

<template>
    <DropDown class="w-8">
        <TweakingIcon width="24" stroke="#292D32" height="24"/>
        <template #dropdown>
            <SelectGroup name="View" class="mt-2">
                <SelectEntry v-model="options" entry="view" value="icon">Large icon view</SelectEntry>
                <SelectEntry v-model="options" entry="view" value="list">Detail lists</SelectEntry>
            </SelectGroup>
            <SelectGroup name="Sort by">
                <SelectEntry v-model="options" entry="sortBy" value="date">Date modified</SelectEntry>
                <SelectEntry v-model="options" entry="sortBy" value="name">Name</SelectEntry>
                <SelectEntry v-model="options" entry="sortBy" value="size">File size</SelectEntry>
            </SelectGroup>
            <div class="mb-2">
                <SelectEntry v-model="options" entry="order" value="ascending" divided>Ascending</SelectEntry>
                <SelectEntry v-model="options" entry="order" value="descending">Descending</SelectEntry>
            </div>
        </template>
    </DropDown>
</template>

<style scoped>

</style>