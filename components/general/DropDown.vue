<script setup lang="ts">
</script>

<template>
    <el-dropdown>
        <slot />
        <template #dropdown>
            <slot name="dropdown" />
        </template>
    </el-dropdown>
</template>

<!--suppress CssUnusedSymbol -->
<style>
.el-dropdown__popper.el-popper {
    box-shadow: 0 1px 2px 0 #0000004D, 0 1px 3px 1px #00000026;
}

li.el-dropdown-menu__item {
    gap: 10px;
    padding: 8px 60px 8px 20px;
    color: var(--emphasis) !important;
    margin: 0 2px;
    border-radius: 2px;
}

.el-dropdown svg {
    outline: none !important;
}

.el-dropdown-menu .el-icon,
.el-dropdown-menu .el-icon svg {
    width: 1.25em !important;
    height: 1.25em !important;
}

.el-dropdown-menu__item:not(.is-disabled):hover,
.el-dropdown-menu__item:not(.is-disabled):focus {
    background-color: #C54C4429;
}

.el-popper__arrow {
    display: none;
}
</style>