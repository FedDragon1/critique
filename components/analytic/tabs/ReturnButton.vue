<script setup lang="ts">

</script>

<template>
    <div class="return" @click.stop="$emit('close')">
        <el-icon size="2rem"><el-icon-back/></el-icon>
    </div>
</template>

<style scoped>
.return {
    color: var(--el-color-white);
    background: var(--el-color-primary);
    border-radius: 0 0 var(--el-border-radius-round) 0;
    position: absolute;
    left: 0;
    top: 0;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.2s ease-in-out;
}

.return:hover {
    background: var(--el-color-danger);
}
</style>