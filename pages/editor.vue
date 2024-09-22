<script setup lang="ts">
import CritiqueEditor from "~/components/editor/CritiqueEditor.vue";
import {useEditorTransforms} from "~/composibles/useTiptapEditor";

const rawResp = `
        <h2>Lorem Ipsum</h2>
        <p>Tincidunt ornare massa eget egestas.

        Slavery [low-confidence]got in[/low-confidence] the way in the South. South Carolina, insecure since the slave uprising in Stono in 1739, could hardly fight against the [low-confidence]British;[/low-confidence] her militia had to be used to keep slaves under control.

        <h3>Lorem Ipsum</h3>
        <p>Sapien eget mi proin sed libero. Aliquam id diam maecenas ultricies mi eget mauris. Amet mattis vulputate enim nulla aliquet porttitor lacus. Pulvinar elementum integer enim neque volutpat ac. Libero volutpat sed cras ornare arcu dui vivamus arcu felis. Urna nunc id cursus metus aliquam eleifend mi in nulla. Justo laoreet sit amet cursus sit. In massa tempor nec feugiat nisl pretium fusce. Vel quam elementum pulvinar etiam non. Nisl nisi scelerisque eu ultrices vitae. Odio ut enim blandit volutpat maecenas volutpat blandit aliquam.</p>
      `
const textTf = useEditorTransforms();
const content = textTf.lowConfidenceInvisibleMarking(rawResp)
</script>

<template>
  <CritiqueEditor :html="content"></CritiqueEditor>
</template>

<style scoped>

</style>