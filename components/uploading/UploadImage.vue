<script setup lang="ts">

</script>

<template>
  <el-upload
      class="upload"
      drag
      ref="upload"
      :show-file-list="false"
      :multiple="false"
      :on-success="(resp) => $emit('success', resp)"
      :before-upload="(image) => $emit('upload', image)"
      action="/api/image/scan">
    <div class="upload-box">
      <el-icon class="el-icon--upload"><el-icon-upload-filled /></el-icon>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        jpg/png/pdf files
      </div>
    </template>
  </el-upload>
</template>

<!--suppress CssUnusedSymbol -->
<style scoped>
:deep(.el-upload-dragger) {
  height: 100%;
}

:deep(.upload-box) {
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: center;
  flex-direction: column;
}

:deep(.el-upload) {
  height: 100%;
}

:deep(.upload) {
  height: 100%;
}

:global(div.gallery > div) {
  flex-grow: 9999;
  height: 100%;
}
</style>