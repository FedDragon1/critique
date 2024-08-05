<script setup lang="ts">
import DashboardAside from "~/components/dashboard/DashboardAside.vue";

const attrs = useAttrs();

defineProps<{
  activate: "/dashboard" | "/dashboard/analytic" | "/dashboard/profile" | "/dashboard/setting"
}>();
</script>

<template>
  <div class="screen-wrapper">
    <section class="container">
      <DashboardAside :activate="activate"></DashboardAside>
      <main>
        <div class="dashboard-main" v-bind="attrs">
          <slot></slot>
        </div>
      </main>
    </section>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-basis: auto;
  flex-direction: row;
  min-width: 0;
}

main {
  box-sizing: border-box;
  display: block;
  flex: 1;
  flex-basis: auto;
  overflow: auto;
  padding: 20px;
}

.dashboard-main {
  margin: var(--dashboard-main-margin);
  width: calc(100% - 2 * var(--dashboard-main-margin) - 2 * var(--dashboard-main-padding));
  height: calc(100% - 2 * var(--dashboard-main-margin) - 2 * var(--dashboard-main-padding));
  background-color: white;
  border-radius: var(--el-border-radius-round);
  padding: var(--dashboard-main-padding);
  overflow-y: auto;
}

.screen-wrapper {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--dashboard-background-color);
}
</style>