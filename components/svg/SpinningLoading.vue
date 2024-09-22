<script setup lang="ts">
const attrs = useAttrs();
</script>

<template>
    <el-icon v-bind="attrs" class="loop"><el-icon-Loading /></el-icon>
</template>

<style scoped>
.loop {
    animation: 2s spin infinite linear;
}
</style>