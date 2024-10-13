<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import CritiqueNode from "~/components/editor/CritiqueNode.vue";

interface CritiqueParagraphNode {
    attrs: {
        hash: string,
        uuid: string
    },
    content: Fragment<CritiqueNode>,
    type: {
        name: string
    }
}

interface CritiqueNode {
    attrs: {
        hash: string,
        uuid: string
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
const content = computed(() => (p.node as unknown as CritiqueParagraphNode).content.content)
</script>

<template>
    <node-view-wrapper as="critique-paragraph">
        <CritiqueNode v-for="node in content" v-bind="node.attrs">
            {{ node.content.content[0].text }}
        </CritiqueNode>
    </node-view-wrapper>
</template>

<style>
</style>