<script setup lang="ts">
import ImageUploader from "~/components/uploading/ImageUploader.vue";
import SeoHead from "~/components/SeoHead.vue";
</script>

<template>
  <SeoHead title="Upload"/>
  <div class="page-wrapper">
    <div class="frame">
      <ImageUploader class="upload-wrapper"/>
    </div>
  </div>
</template>

<style scoped>
.upload-wrapper {
  height: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  max-width: 950px;
}

.frame {
  flex-grow: 9999;
}

.page-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>