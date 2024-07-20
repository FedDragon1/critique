<script setup lang="ts">

</script>

<template>
  <el-upload
      class="upload-btn"
      drag
      ref="upload"
      :show-file-list="false"
      :multiple="false"
      :on-success="(resp) => $emit('success', resp)"
      :before-upload="(image) => $emit('upload', image)"
      action="/api/image/scan">
    <div class="upload-box">
      <slot/>
    </div>
  </el-upload>
</template>

<style scoped>
:deep(.el-upload-dragger) {
  padding: 0 !important;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  border-style: solid !important;
  transition: color 0.2s ease-in-out, border 0.2s ease-in-out;
}

:deep(.el-upload-dragger:hover) {
  color: var(--el-color-primary)
}

.upload-box {
  line-height: 34px;
}

.upload-btn {
  width: 30px;
}
</style>