<script setup lang="ts">
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-3";
import CritiqueNode from "~/components/editor/CritiqueNode.vue";

interface CritiqueHeadingNode {
    attrs: {
        level: number
    },
    content: Fragment<CritiqueNode>,
    type: {
        name: string
    }
}

interface CritiqueNode {
    attrs: {
        hash: string,
        uuid: string,
        index: string,
        node: string,
    },
    content: Fragment<TextNode>,
    type: {
        name: string
    }
}

interface TextNode {
    attrs: {
        hash: string,
        uuid: string
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
const node = (p.node as unknown as CritiqueHeadingNode)
const content = computed(() => node.content.content)
const tag = computed(() => `h${node.attrs.level}`)
</script>

<template>
    <node-view-wrapper :as="tag">
        <CritiqueNode v-for="critique in content" :key="critique.attrs.uuid" v-bind="critique.attrs">
            {{ critique.content.content[0].text }}
        </CritiqueNode>
    </node-view-wrapper>
</template>

<style scoped>

</style>