<script setup lang="ts">

import CritiqueCard from "~/components/analytic/CritiqueCard.vue";
import CritiqueTag from "~/components/analytic/CritiqueTag.vue";

</script>

<template>
    <div class="my">
        <CritiqueCard title="Test" content="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi commodi consequatur culpa dicta expedita fugiat odit tenetur! A ab asperiores cupiditate enim eveniet fugiat necessitatibus, odit omnis, quia, sunt vel!"
                      :tags="['tag1', 'tag2']"></CritiqueCard>
    </div>
    <div class="my">
        <CritiqueTag name="Tag1" :count="10"></CritiqueTag>
    </div>
</template>

<style scoped>
div.my {
    padding: 20px;
}
</style>