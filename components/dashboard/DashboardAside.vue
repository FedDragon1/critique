<script setup lang="ts">

import BrandIconLight from "~/components/svg/BrandIconLight.vue";
import DashboardIcon from "~/components/svg/DashboardIcon.vue";
import AnalyticsIcon from "~/components/svg/AnalyticsIcon.vue";
import ProfileIcon from "~/components/svg/ProfileIcon.vue";
import SettingsIcon from "~/components/svg/SettingsIcon.vue";

const routes = [
  {
    to: "/dashboard",
    component: DashboardIcon,
    caption: "Dashboard"
  },
  {
    to: "/analytic",
    component: AnalyticsIcon,
    caption: "Analytics"
  },
  {
    to: "/dashboard/profile",
    component: ProfileIcon,
    caption: "Profile"
  },
  {
    to: "/dashboard/setting",
    component: SettingsIcon,
    caption: "Settings"
  },
]

defineProps<{
  activate: "/dashboard" | "/analytic" | "/dashboard/profile" | "/dashboard/setting"
}>();

</script>

<template>
  <aside class="dashboard-aside">
    <div class="aside-top">
      <BrandIconLight :height="40" style="padding-top: 20px;"></BrandIconLight>
      <div class="functions">
        <template v-for="route in routes" :key="route.to">
          <NuxtLink class="function-tab" :to="route.to" :class="{active: activate === route.to}">
            <component :is="route.component"
                       width="20"
                       height="20"
                       :fill="activate === route.to ? '#ffffff' : '#809FB8'"></component>
            {{ route.caption }}
          </NuxtLink>
        </template>
      </div>
    </div>
    <div class="aside-footer">
      <span>© 2024 Critique</span>
      <span class="small">Enhancing reading comprehension<br>and critical analysis with AI.</span>
    </div>
  </aside>
</template>

<!--suppress CssUnusedSymbol -->
<style scoped>
.dashboard-aside {
  width: var(--aside-width);
  border-right: 1px solid var(--el-border-color);
  padding: var(--dashboard-main-padding);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: auto;
}

.aside-footer {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: var(--dashboard-main-margin);
}

.small {
  font-size: 0.8rem;
  color: var(--el-text-color-link);
}

.function-tab {
  display: flex;
  width: 100%;
  gap: 10px;
  height: 60px;
  text-decoration: none;
  color: var(--el-text-color-link);
  align-items: center;
  padding-left: 20px;
  translate: -20px 0;
  border-radius: 0 20px 20px 0;
}

.function-tab > img {
  aspect-ratio: 1 / 1;
  height: 20px;
  display: inline-block;
  vertical-align: baseline;
}

.functions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aside-top {
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-content: flex-start;
}

.active {
  background-color: var(--el-color-danger);
  color: var(--el-color-white)
}
</style>