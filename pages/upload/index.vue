<script setup lang="ts">
import type {UploadInstance} from "element-plus";
import type {Ref} from "vue";
import type {Contour, FourPoints} from "~/types/cvtypes";

const upload = ref<UploadInstance>()
const contours: Ref<Contour[]> = ref([]);
const originalSource = ref("")
const cannySource = ref("");
const perspectiveImg = ref("")

const fourPoints = ref(contours.value[0]?.points as FourPoints)

const submitted = (resp: any) => {
  cannySource.value = resp.data.png
}

const contour = async () => {
  const resp = await $fetch("/api/image/segment", {
    method: "POST",
    body: {image: cannySource.value}
  })
  if (resp.success === false) {
    ElMessage.error("No border detected")
  }
  contours.value = resp.data.contours
  console.log(contours.value)
  // canvasController.drawContour(contours.value[0].points)
}

const perspective = async () => {
  const resp = await $fetch("/api/image/transform", {
    method: "POST",
    body: {
      points: fourPoints.value,
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
<!--  <img :src="`data:image/png;base64,${originalSource}`"/>-->
<!--  <canvas ref="canvas"></canvas>-->
  <FourPointsSelection v-if="originalSource"
                       :image="originalSource"
                       :point-spacing="50"
                       fill-style="#c54c4444"
                       point-fill="#8b2018"
                       stroke-style="#8b2018"
                       :line-width="2"
                       :point-radius="10"
                       v-model="fourPoints"></FourPointsSelection>
  <img :src="`data:image/png;base64,${perspectiveImg}`"/>
</template>

<style scoped>
canvas {
  border: 1px solid whitesmoke;
}

img {
  max-width: 30vw;
}
</style>