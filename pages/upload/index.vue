<script setup lang="ts">
import type {UploadInstance} from "element-plus";

const upload = ref<UploadInstance>()

const source = ref("");

const submitted = (resp: any) => {
  console.log(resp.data)
  source.value = resp.data
}
</script>

<template>
  <el-upload
      ref="upload"
      drag
      :on-success="submitted"
      action="/api/image/scan">
    <el-icon class="el-icon--upload"><el-icon-upload-filled /></el-icon>
    <div class="el-upload__text">
      Drop file here or <em>click to upload</em>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        jpg/png files with a size less than 500kb
      </div>
    </template>
  </el-upload>
  <img :src="`data:image/png;base64,${source}`"/>
</template>

<style scoped>

</style>