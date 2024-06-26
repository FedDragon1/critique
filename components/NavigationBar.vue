<script setup lang="ts">
const searchText = ref<string>("");
defineProps<{
  name: string,
  email: string,
  avatar: string,
}>()
</script>

<template>
  <div class="nav-wrapper">
    <div class="left">
      <div class="logo-wrapper">
        <img src="" alt="critique">
      </div>
      <el-input v-model="searchText" autocomplete="off" clearable placeholder="Search critiques" style="width: 300px" />
    </div>
    <UserProfile :name="name" :email="email" :avatar="avatar"></UserProfile>
  </div>
</template>

<style scoped>
.nav-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left {
  display: flex;
}

.logo-wrapper {
  width: var(--aside-width);
}
</style>