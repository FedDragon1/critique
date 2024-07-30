<script setup lang="ts">
import BrandIconLight from "~/components/svg/BrandIconLight.vue";

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
        <NuxtLink to="/"><BrandIconLight :height="40" /></NuxtLink>
      </div>
      <el-input v-model="searchText" autocomplete="off" clearable placeholder="Search critiques" style="width: 300px; height: 40px" />
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
  align-items: center;
}

.logo-wrapper {
  width: calc(var(--aside-width) - 20px);  /* padding 20px */
  display: flex;
  height: 40px;
}

img {
  height: 100%;
}
</style>