<script setup lang="ts">

import BrandIconLight from "~/components/svg/BrandIconLight.vue";
</script>

<template>
<div class="nav-wrapper">
  <nav class="nav">
    <NuxtLink to="/"><BrandIconLight :height="50"></BrandIconLight></NuxtLink>
    <div class="menu">
      <NuxtLink class="router-link" to="/">Home</NuxtLink>
      <NuxtLink class="router-link" to="/about">About Us</NuxtLink>
      <NuxtLink class="router-link" to="/service">Services</NuxtLink>
      <NuxtLink class="router-link" to="/contact">Contact Us</NuxtLink>
    </div>
    <div class="menu small-gap">
      <NuxtLink class="router-link login" to="/login">Login</NuxtLink>
      <NuxtLink class="router-link sign-up" to="/register">Sign Up</NuxtLink>
    </div>
  </nav>
</div>
</template>

<style scoped>
.nav-wrapper {
  width: 100%;
  position: fixed;
  top: 48px;
  height: var(--nav-height);
}

.menu {
  display: flex;
  gap: 50px;
  align-items: center;
}

.menu.small-gap {
  gap: 30px;
}

.nav {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
}

.router-link {
  color: var(--el-text-color);
  text-decoration: none;
  user-select: none;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
}

.router-link:hover, .login, .sign-up {
  color: var(--el-color-primary);
}

.router-link-active {
  color: var(--el-color-primary)
}

.sign-up {
  border: 1px solid var(--el-color-primary);
  border-radius: var(--el-border-radius-round);
  padding: 12px 24px;
  transition: all 0.2s ease-in-out;
}

.sign-up:hover {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
}

.login {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  border-radius: var(--el-border-radius-round);
  padding: 12px 24px;
  border: 1px solid transparent;
  transition: all 0.2s ease-in-out;
}

.login:hover {
  background-color: initial;
  border: 1px solid var(--el-color-primary);
}
</style>