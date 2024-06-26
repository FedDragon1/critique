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
<!--    TODO: sandwich selection-->
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