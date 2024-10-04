<script setup lang="ts">
import {DeleteFilled, StarFilled, Edit, Star} from '@element-plus/icons-vue'

const props = defineProps<{
    uuid: string,
    fileName: string,
    previewImage: string,
    lastModified: string,
    isFavorite: boolean,
    disableOps?: boolean
}>();

const preview = ref("")

const client = useSupabaseClient()

if (!props.disableOps) {
    client.storage.from("file-preview").download(props.previewImage)
        .then(result => result.data?.text())
        .then(link => preview.value = link ?? "")
}

const attrs = useAttrs();
</script>

<template>
    <div class="preview-wrapper" v-bind="attrs">
        <div class="preview-operation">
            <el-dropdown>
                <el-icon>
                    <el-icon-more-filled></el-icon-more-filled>
                </el-icon>
                <template #dropdown v-if="!disableOps">
                    <el-dropdown-menu>
                        <el-dropdown-item @click="$emit('delete', uuid)" :icon="DeleteFilled">Delete</el-dropdown-item>
                        <el-dropdown-item
                            v-if="isFavorite"
                            @click="$emit('unfavorite', uuid)"
                            :icon="Star">Unfavorite
                        </el-dropdown-item>
                        <el-dropdown-item
                            v-else
                            @click="$emit('favorite', uuid)"
                            :icon="StarFilled">Favorite
                        </el-dropdown-item>
                        <el-dropdown-item :icon="Edit"
                                          @click="$emit('rename', uuid)">Rename
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
        <div class="preview-image-wrapper">
            <span>This file has no preview</span>
            <div class="preview-image" :style="{'background-image': `url('${preview}')`}"></div>
        </div>
        <div class="preview-texts">
            <span>{{ fileName }}</span>
            <span class="description-text">Last edited {{ lastModified }}</span>
        </div>
    </div>
</template>

<style scoped>
.preview-image {
    width: 100%;
    height: 100%;
    background-size: cover;
    position: absolute;
    background-position: center;
}

.preview-image-wrapper {
    aspect-ratio: 4/3;
    border: 1px solid var(--el-border-color);
    margin-top: 10px;
    margin-bottom: 10px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--el-border-radius-round);
    overflow: hidden;
}

.preview-texts {
    display: flex;
    flex-direction: column;
}

:focus {
    outline: none;
    color: var(--el-color-primary)
}

.preview-operation {
    display: flex;
    justify-content: flex-end;
}

.preview-wrapper {
    width: 100%;
    height: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color);
    padding: 20px;
    border-radius: var(--el-border-radius-round);
    transition: 0.2s all ease-in-out;
}

.preview-wrapper:hover {
    border: 1px solid var(--el-color-error);
    color: var(--el-color-error);
}
</style>