<script setup lang="ts">
import {useFileStore} from "~/stores/fileStore";

const fileStore = useFileStore()
</script>

<template>
  <DashboardFrame activate="/analytic" padding="0px" style="display: flex; flex-direction: column;">
    <UploadingNav title="New Critique File"></UploadingNav>
    Review

    {{fileStore.ocrResult}}
  </DashboardFrame>
</template>

<style scoped>

</style>