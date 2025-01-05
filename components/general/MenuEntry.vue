<script setup lang="ts">
const props = defineProps<{
    divided?: boolean
}>()

const border = computed(() => props.divided ?? false)
</script>

<template>
    <hr v-if="border" class="my-2" />
    <div class="px-1 cursor-pointer">
        <div class="flex px-4 py-2 w-full justify-between gap-10 items-center hover:bg-[#C54C4429]">
            <div class="flex gap-4 items-center text-emphasis flex-shrink-0 text-sm">
                <slot name="icon"></slot>
                <slot />
            </div>
            <div class="text-[0.6rem] text-zinc-500 flex-shrink-0">
                <slot name="hotkey" />
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>