<script setup lang="ts">
import type {Ref} from "vue";
import type {Contour, FourPoints} from "~/types/cvtypes";
import FourPointsSelection from "~/components/uploading/FourPointsSelection.vue";

const attrs = useAttrs();
const props = defineProps<{
    image: string,
    canny: string,
}>()

const contours: Ref<Contour[]> = ref([]);

const fourPoints = ref<FourPoints>()
const suggestedContour = ref<FourPoints>()
const ready = ref(false)

const contour = async () => {
    const resp = await $fetch("/api/image/segment", {
        method: "POST",
        body: {image: props.canny}
    })

    ready.value = true

    if (resp.success === false) {
        ElMessage.error({
            message: "No border detected",
            grouping: true
        })
        return
    }
    contours.value = resp.data.contours
    suggestedContour.value = resp.data.contours[0].points as FourPoints
}

defineExpose({
    fourPoints
})

contour()
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
                                 class="wrapper"
                                 v-if="ready"
                                 :line-width="2"
                                 :point-radius="10"
                                 :canvas-max-height="600"
                                 :canvas-max-width="700"
                                 v-model="fourPoints"></FourPointsSelection>
            <EditorUnavailable style="width: 700px" v-else/>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    width: 700px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>