<script setup lang="ts">
import type {UploadInstance} from "element-plus";
import {useCanvas} from "~/composibles/useCanvas";
import type {Ref} from "vue";
import type {Contour} from "~/types/cvtypes";

const upload = ref<UploadInstance>()
const canvas = ref<HTMLCanvasElement>()
const contours: Ref<Contour[]> = ref([]);
const originalSource = ref("")
const cannySource = ref("");
const perspectiveImg = ref("")

watchEffect(() => {
  if (!canvas.value) {
    return;
  }
  canvasController = useCanvas(canvas as Ref<HTMLCanvasElement>)
})

watch(cannySource, () => {
  canvasController.paint(cannySource.value)
})

let canvasController: ReturnType<typeof useCanvas>;

const submitted = (resp: any) => {
  cannySource.value = resp.data.png
}

const contour = async () => {
  const resp = await $fetch("/api/image/segment", {
    method: "POST",
    body: {image: cannySource.value}
  })
  contours.value = resp.data.contours
  console.log(contour)
  canvasController.drawContour(contours.value[0].points)
}

const perspective = async () => {
  const resp = await $fetch("/api/image/transform", {
    method: "POST",
    body: {
      points: contours.value[0].points,
      image: originalSource.value
    }
  })
  perspectiveImg.value = resp.data.png
}

const storeImage = (file: File) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    originalSource.value = (reader.result as string).split(',')[1];
  }
}
</script>

<template>
  <el-upload
      drag
      ref="upload"
      :multiple="false"
      :on-success="submitted"
      :before-upload="storeImage"
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
  <el-button type="primary" @click="perspective">Get Perspective</el-button>
  <img :src="`data:image/png;base64,${originalSource}`"/>
  <canvas ref="canvas"></canvas>
  <img :src="`data:image/png;base64,${perspectiveImg}`"/>
</template>

<style scoped>
canvas {
  border: 1px solid whitesmoke;
}
</style>