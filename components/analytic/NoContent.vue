<script setup lang="ts">

const attrs = useAttrs()
</script>

<template>
    <div class="no-content" v-bind="attrs">
        <slot>
            <h3>It is empty here</h3>
            <span>Talk to Critique AI to generate some</span>
        </slot>
    </div>
</template>

<style scoped>
.no-content {
    width: 300px;
    border: var(--el-border);
    border-radius: var(--el-border-radius-round);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
}

.no-content span {
    margin-bottom: 2rem;
}
</style>