<script setup lang="ts">
import type {Ref} from "vue";
import type {Contour, FourPoints} from "~/types/cvtypes";
import FourPointsSelection from "~/components/uploading/FourPointsSelection.vue";

const attrs = useAttrs();
const props = defineProps<{
  image: string,
  canny: string
}>()

const contours: Ref<Contour[]> = ref([]);
const perspectiveImg = ref("")

const fourPoints = ref<FourPoints>()
const suggestedContour = ref<FourPoints>()

const contour = async () => {
  const resp = await $fetch("/api/image/segment", {
    method: "POST",
    body: {image: props.canny}
  })
  if (resp.success === false) {
    ElMessage.error("No border detected")
    return
  }
  contours.value = resp.data.contours
  suggestedContour.value = resp.data.contours[0].points as FourPoints
}

const perspective = async () => {
  const resp = await $fetch("/api/image/transform", {
    method: "POST",
    body: {
      points: fourPoints.value,
      image: props.image
    }
  })
  perspectiveImg.value = resp.data.png
}

await contour()
</script>

<template>
  <div v-bind="attrs">
    <div>
        <FourPointsSelection :image="props.image"
                             :point-spacing="50"
                             :suggested-contour="suggestedContour"
                             fill-style="#c54c4444"
                             point-fill="#8b2018"
                             stroke-style="#8b2018"
                             :line-width="2"
                             :point-radius="10"
                             :canvas-max-height="750"
                             :canvas-max-width="600"
                             v-model="fourPoints"></FourPointsSelection>
    </div>
  </div>
</template>

<style scoped>

</style>