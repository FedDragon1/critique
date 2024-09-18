<script setup lang="ts">
import {DeleteFilled, Edit, Star, StarFilled} from "@element-plus/icons-vue";

defineProps<{
  title: string,
  isFavorite?: boolean,
  disableOp?: boolean
}>()
</script>

<template>
  <nav>
    <div>
      <span>{{ title }}</span>
      <el-dropdown v-if="!(disableOp ?? false)">
        <el-icon class="el-icon--right">
          <el-icon-arrow-down/>
        </el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$emit('delete')" :icon="DeleteFilled">Delete</el-dropdown-item>
            <el-dropdown-item
                v-if="isFavorite"
                @click="$emit('unfavorite')"
                :icon="Star">Unfavorite</el-dropdown-item>
            <el-dropdown-item
                v-else
                @click="$emit('favorite')"
                :icon="StarFilled">Favorite</el-dropdown-item>
            <el-dropdown-item :icon="Edit"
                              @click="$emit('rename')">Rename</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </nav>
</template>

<style scoped>
nav {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid var(--el-border-color);
  flex-shrink: 0;
}

nav > div {
  display: flex;
  align-items: center;
  gap: 3px;
}
</style>