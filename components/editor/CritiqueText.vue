<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

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
<!--    <critique-paragraph>-->
<!--        <critique v-for="node in content" v-bind="node.attrs">-->
<!--            {{ node.content.content[0].text }}-->
<!--        </critique>-->
<!--    </critique-paragraph>-->
    <node-view-wrapper as="critique-paragraph">
        <critique v-for="node in content" v-bind="node.attrs">
            {{ node.content.content[0].text }}
        </critique>
    </node-view-wrapper>
</template>

<style>
</style>