<script setup lang="ts">
defineProps<{
  name: string,
  email: string,
  avatar: string,
}>()
</script>

<template>
  <div class="profile-wrapper">
    <img :src="avatar" :alt="name">
    <div class="text">
      <el-text class="name" size="default">{{ name }}</el-text>
      <el-text class="email" size="small">{{ email }}</el-text>
    </div>
    <el-dropdown>
      <el-icon class="el-icon--right">
        <el-icon-expand/>
      </el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <el-icon><el-icon-tools /></el-icon>
            Settings
          </el-dropdown-item>
          <el-dropdown-item>
            <NuxtLink to="/logout">
              <el-icon><el-icon-switch-button /></el-icon>
              Log out
            </NuxtLink>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.profile-wrapper {
  height: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
}

img {
  height: 60%;
  border-radius: 50%;
}

.text {
  display: flex;
  flex-direction: column;

}

span {
  width: 100%;
}

.name {
  color: var(--el-text-color-primary);
}
</style>