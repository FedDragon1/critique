<script setup lang="ts">
import DashboardAside from "~/components/dashboard/DashboardAside.vue";

const attrs = useAttrs();

const props = defineProps<{
  padding?: string,
  activate: "/dashboard" | "/analytic" | "/setting",
  postToggle?: () => void
}>();

const main = ref();

onMounted(() => {
  if (props.padding) {
    main.value.style.setProperty("--dashboard-main-padding", props.padding)
  }
})
</script>

<template>
  <div class="screen-wrapper">
    <section class="container">
      <DashboardAside :activate="activate" :post-toggle="postToggle"></DashboardAside>
      <div class="dashboard-main" v-bind="attrs" ref="main">
        <slot></slot>
      </div>
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
  width: calc(100% - 2 * var(--dashboard-main-padding));
  height: calc(100% - 2 * var(--dashboard-main-padding));
  background-color: white;
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