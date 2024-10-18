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
const _underlined = ref(false)
const _focused = ref(false)
const _hovered = ref(false)
const show = ref(true)
const emitter = useEventBus()
const dom = useTemplateRef<HTMLElement>("dom")

const selected = computed(() => _selected.value)
const underlined = computed(() => _underlined.value)
const focused = computed(() => _focused.value)
const hovered = computed(() => _hovered.value)
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
            select: () => _selected.value = true
        })
    }
}

defineExpose({
    selected,
    underlined,
    hovered,
    focused,
    uuid,
    hash
})

emitter.on("critique-underline", ({ node, from, to }) => {
    if (props.node !== node || Number(props.index) < from || Number(props.index) > to) {
        return
    }
    _underlined.value = true
})
emitter.on("critique-remove-underline", ({ node, from, to }) => {
    if (props.node !== node || Number(props.index) < from || Number(props.index) > to) {
        return
    }
    _underlined.value = false
})
emitter.on("critique-underline-focus", ({ node, from, to }) => {
    if (props.node !== node || Number(props.index) < from || Number(props.index) > to) {
        return
    }
    _focused.value = true
})
emitter.on("critique-remove-underline-focus", ({ node, from, to }) => {
    if (props.node !== node || Number(props.index) < from || Number(props.index) > to) {
        return
    }
    _focused.value = false
})
// emitter.on("critique-underline-reset", ({ node, from, to }) => {
//     if (props.node !== node || Number(props.index) < from || Number(props.index) > to) {
//         return
//     }
//     _focused.value = false
//     _underlined.value = false
// })
emitter.on("critique-hover", ({ node, from, to }) => {
    if (props.node !== node || Number(props.index) < from || Number(props.index) > to) {
        return
    }
    _hovered.value = true
})
emitter.on("critique-remove-hover", ({ node, from, to }) => {
    if (props.node !== node || Number(props.index) < from || Number(props.index) > to) {
        return
    }
    _hovered.value = false
})
emitter.on("critique-toggle", () => show.value = !show.value)
</script>

<template>
    <critique :uuid="uuid"
              :hash="hash.toString()"
              :index="index.toString()"
              :node="node"
              :class="{ selected: _selected, underlined: _underlined, focused: _focused, hovered: _hovered, show }"
              ref="dom"
              @click="() => onClick()">
        <slot />
    </critique>
</template>

<style scoped>
critique.selected {
    background: var(--critique-selected-color);
}

critique.show.underlined {
    text-decoration: underline;
    text-decoration-color: var(--critique-underline-color);
    text-decoration-thickness: 1px;
}

critique.show.underlined.focused {
    text-decoration-color: var(--critique-underline-color-focused);
    text-decoration-thickness: 2px;
}

critique.show.underlined.focused.hovered {
    background-color: var(--critique-hover-color);
}
</style>