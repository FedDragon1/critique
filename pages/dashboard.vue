<script setup lang="ts">

const user = useSupabaseUser();


definePageMeta({
  middleware: 'auth'
})

</script>

<template>
  <div class="screen-wrapper">
    <el-container style="width: 100%; height: 100%">
      <el-header>
        <NavigationBar :name="user?.user_metadata?.name"
                       :email="user?.user_metadata?.email"
                       :avatar="user?.user_metadata?.avatar_url"/>
      </el-header>
      <el-container>
        <el-aside class="dashboard-aside">Aside</el-aside>
        <el-main>Dashboard
          {{ user }}</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.screen-wrapper {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.dashboard-aside {
  width: var(--aside-width);
}
</style>