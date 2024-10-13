<script setup lang="ts">
import useEventBus from "~/composibles/useEventBus";

const props = defineProps<{
    uuid: string,
    hash: string | number,
    index: string | number,
    node: string
}>();

const slots = useSlots()
const _selected = ref(false)
const emitter = useEventBus()
const dom = useTemplateRef<HTMLElement>("dom")

const selected = computed(() => _selected.value)
const uuid = computed(() => props.uuid)
const hash = computed(() => props.hash)
const node = computed(() => props.node)
const index = computed(() => parseInt(<string>props.index))

// https://stackoverflow.com/questions/42950967/how-to-reference-text-thats-in-slot-slot-in-vue-js
const getSlotChildrenText = (children: any) => children.map((node: any) => {
    if (!node.children || typeof node.children === 'string') return node.children || ''
    else if (Array.isArray(node.children)) return getSlotChildrenText(node.children)
    else if (node.children.default) return getSlotChildrenText(node.children.default())
}).join('')

function onClick(toggle?: boolean) {
    const slotContent = getSlotChildrenText(slots.default!()) as string
    _selected.value = toggle ?? !_selected.value
    if (_selected.value) {
        emitter.emit("critique-select", {
            content: slotContent,
            uuid: uuid.value,
            node: node.value,
            index: index.value,
            hash: hash.value.toString(),
            dom: dom.value,
            unselect: () => _selected.value = false
        })
    } else {
        emitter.emit("critique-unselect", {
            uuid: uuid.value,
            hash: hash.value.toString(),
        })
    }
}

defineExpose({
    selected,
    uuid,
    hash
})
</script>

<template>
    <critique :uuid="uuid"
              :hash="hash.toString()"
              :index="index.toString()"
              :node="node"
              :class="{ selected: _selected }"
              ref="dom"
              @click="() => onClick()">
        <slot />
    </critique>
</template>

<style scoped>
critique.selected {
    background: var(--critique-selected-color);
}
</style>