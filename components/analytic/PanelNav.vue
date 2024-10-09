<script setup lang="ts">
import type {ElIcon} from "#components";

defineProps<{
    dragEnd: boolean,
    togglePanel: (...args: any[]) => void,
    quickActions: any,
    draggingPanel: boolean,
    disabled: boolean
}>()
</script>

<template>
    <nav class="panel-nav">
        <el-icon size="1.5rem" :class="{ 'flipped': dragEnd }" class="panel-arrow"
                 @click="togglePanel">
            <el-icon-right></el-icon-right>
        </el-icon>
        <div class="panel-quick-actions"
             :class="{ 'no-select': draggingPanel, 'disabled': disabled }"
             :key="actionName"
             @click="() => !disabled && action.handler()"
             v-for="(action, actionName) in quickActions">
            <el-icon>
                <component :is="action.icon"></component>
            </el-icon>
            <span class="panel-quick-action-name nowrap">{{ action.caption }}</span>
        </div>
    </nav>
</template>

<style scoped>
.panel-quick-actions.disabled {
    color: var(--el-disabled-text-color);
    border: var(--el-disabled-border-color) 1px solid;
    cursor: not-allowed;
}

.panel-quick-actions.disabled i {
    color: var(--el-disabled-text-color);
}

.panel-nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    gap: 20px;
    margin-top: 8px;
}

.panel-quick-actions {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.panel-quick-actions i {
    color: var(--el-color-primary)
}

.panel-quick-actions:hover {
    border: 1px solid var(--el-color-primary);
    color: var(--el-color-primary);
}

.panel-arrow {
    transition: all 0.2s ease-in-out;
    color: var(--el-text-color-secondary)
}

.panel-arrow:hover {
    color: var(--el-color-primary)
}

.flipped {
    transform: rotateY(180deg);
}

.panel-quick-actions {
    border: var(--el-border);
    padding: 10px 15px;
    border-radius: var(--el-border-radius-round);
    transition: all 0.2s ease-in-out;
}
</style>