<script setup lang="ts">

import BrandIconLight from "~/components/svg/BrandIconLight.vue";
</script>

<template>
    <div class="screen-wrapper">
        <div class="card">
            <div class="header">
                <BrandIconLight :width="200" />
            </div>
            <div class="title">
                <h1><slot name="title"/></h1>
            </div>
            <div class="content">
                <slot />
            </div>
            <div class="footer">
                <slot name="footer">
                    <el-text size="small">©2024 Critiques. All rights reserved.</el-text>
                </slot>
            </div>
        </div>
    </div>
</template>

<style scoped>
.screen-wrapper {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.card {
    height: 80vh;
    max-height: 550px;
    width: 80vw;
    max-width: 400px;
    border-radius: var(--el-border-radius-base);
    border: 1px solid var(--el-border-color);
    padding: 50px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.header {
    height: 20%;
    max-height: 100px;
}

.content {
    flex-grow: 999;
}
</style>