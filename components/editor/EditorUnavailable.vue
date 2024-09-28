<script setup lang="ts">

import Loading from "~/components/svg/Loading.vue";

const attrs = useAttrs()
</script>

<template>
    <div v-bind="attrs" class="editor-unavailable">
        <Loading/>
    </div>
</template>

<style scoped>
.editor-unavailable {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    gap: 20px;
    align-items: center;
    flex-direction: column;
}
</style>