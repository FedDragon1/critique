<script setup lang="ts">
import type {UploadInstance} from "element-plus";
import {useCanvas} from "~/composibles/useCanvas";
import type {Ref} from "vue";

const upload = ref<UploadInstance>()
const canvas = ref<HTMLCanvasElement>()
const source = ref("");

watchEffect(() => {
  if (!canvas.value) {
    return;
  }
  canvasController = useCanvas(canvas as Ref<HTMLCanvasElement>)
})

watch(source, () => {
  canvasController.paint(source.value)
})

let canvasController: ReturnType<typeof useCanvas>;

const submitted = (resp: any) => {
  source.value = resp.data.png
}

const contour = async () => {
  const resp = await $fetch("/api/image/segment", {
    method: "POST",
    body: {image: source.value}
  })
  const contour: Contour[] = resp.data.contours
  console.log(contour)
  canvasController.drawContour(contour[0].points)
}
</script>

<template>
  <el-upload
      drag
      ref="upload"
      :multiple="false"
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
  <el-button type="primary" @click="contour">Extract Border</el-button>
<!--  <img :src="`data:image/png;base64,${source}`"/>-->
  <canvas ref="canvas"></canvas>
</template>

<style scoped>
canvas {
  border: 1px solid whitesmoke;
}
</style>