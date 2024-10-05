<script setup lang="ts">
import {Position} from "@element-plus/icons-vue";

const emit = defineEmits([
    "toggle-critiques",
    "toggle-summaries"
])

const viewModeDisplay: ViewModes = {
    document: {
        display: 'Document View',
    },
    summary: {
        display: 'Summary View',
    },
    edit: {
        display: 'Text Editor View',
    }
} as const
const controls: ShortCut = {
    toggleCritiques: {
        display: 'Show/Hide all critiques',
        hotkey: 'Ctrl+H',
        callback: () => emit("toggle-critiques")
    },
    toggleSummaries: {
        display: 'Show/Hide all summaries',
        hotkey: 'Ctrl+Shift+H',
        callback: () => emit("toggle-summaries")
    }
}
const documentTools = {
    selector: {
        icon: Position,
        display: 'Selector'
    }
} as const

const viewMode = defineModel<keyof typeof viewModeDisplay>("viewMode")
const documentActiveTool = defineModel<string>("docActiveTool")
</script>

<template>
    <nav class="sub-nav">
        <div class="view-selector">
            <span class="nowrap">{{ viewModeDisplay[viewMode!].display }}</span>
            <el-dropdown>
                <el-icon>
                    <el-icon-arrow-down></el-icon-arrow-down>
                </el-icon>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-for="(mode, view) in viewModeDisplay"
                                          @click="() => viewMode = view"
                                          :key="view">{{ mode.display }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
        <div v-if="viewMode === 'document'" class="document-controls">
            <div class="document-tool">
                <div class="document-tool-item"
                     v-for="(value, key) in documentTools"
                     :key="key"
                     @click="documentActiveTool = key"
                     :class="{'document-tool-selected': documentActiveTool === key}">
                    <el-icon size="1.5rem">
                        <component :is="value.icon"></component>
                    </el-icon>
                    <span class="nowrap">{{ value.display }}</span>
                </div>
            </div>
            <div class="document-view">
                <el-dropdown placement="bottom-end">
                    <el-icon size="1.8rem">
                        <el-icon-expand class="hover-color"></el-icon-expand>
                    </el-icon>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item :key="name"
                                              v-for="(shortCut, name) in controls">
                                <div class="document-control-container">
                                    <span class="document-control-option">{{ shortCut.display }}</span>
                                    <span class="document-control-hotkey">{{ shortCut.hotkey }}</span>
                                </div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
        <div v-else class="summary-tabs">
            <!--TODO-->
        </div>
    </nav>
</template>

<style scoped>
.hover-color {
    color: var(--el-text-color);
    transition: color 0.2s ease-in-out;
}

.hover-color:hover {
    color: var(--el-color-danger);
}

.document-view {
    display: flex;
    gap: 10px;
    align-items: center;
    padding-left: 20px;
}

.document-tool-selected {
    background: var(--el-color-danger);
    color: var(--el-color-white)
}

.document-tool {
    display: flex;
    height: 100%;
}

.document-tool-item {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 15px 0 10px;
}

.document-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-grow: 999;
}

.view-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-right: 10px;
    border-right: 1px solid var(--el-border-color);
}

.sub-nav {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid var(--el-border-color);
    padding: 0 15px;
    height: 40px;
    flex-shrink: 0;
}

.document-control-hotkey {
    color: var(--el-text-color-secondary)
}

.document-control-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
}
</style>