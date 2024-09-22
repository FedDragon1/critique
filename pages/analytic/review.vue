<script setup lang="ts">
import {useFileStore} from "~/stores/fileStore";
import TiptapEditor from "~/components/editor/TiptapEditor.vue";

const fileStore = useFileStore()
</script>

<template>
  <DashboardFrame activate="/analytic" padding="0px" style="display: flex; flex-direction: column;">
    <UploadingNav title="New Critique File"></UploadingNav>
    Review

    <TiptapEditor></TiptapEditor>

    {{fileStore.ocrResult}}
  </DashboardFrame>
</template>

<style scoped>

</style>