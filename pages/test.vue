<script setup lang="ts">

import CritiqueCard from "~/components/analytic/CritiqueCard.vue";

</script>

<template>
    <div>
        <CritiqueCard title="Test" content="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi commodi consequatur culpa dicta expedita fugiat odit tenetur! A ab asperiores cupiditate enim eveniet fugiat necessitatibus, odit omnis, quia, sunt vel!"
                      :tags="['tag1', 'tag2']"></CritiqueCard>
    </div>

</template>

<style scoped>
div {
    padding: 20px;
}
</style>