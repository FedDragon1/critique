<script setup lang="ts">
import {nodeViewProps} from "@tiptap/vue-3";
import CritiqueNodeVue from "~/components/editor/CritiqueNode.vue";

interface CritiqueNode {
    attrs: {
        hash: string,
        uuid: string,
        index: string,
        node: string
    },
    content: Fragment<TextNode>,
    type: {
        name: string
    }
}

interface TextNode {
    attrs: {
        hash: string,
        uuid: string,
    },
    content: [],
    text: string,
    type: {
        name: string
    }
}

interface Fragment<T> {
    content: T[]
}

const p = defineProps(nodeViewProps);
const node = computed(() => p.node as unknown as CritiqueNode)
const content = computed(() => node.value.content.content)
</script>

<template>
    <CritiqueNodeVue :uuid="node.attrs.uuid"
                     :hash="node.attrs.hash"
                     :index="node.attrs.index"
                     :node="node.attrs.node">
        {{ content }}
    </CritiqueNodeVue>
</template>

<style scoped>

</style>