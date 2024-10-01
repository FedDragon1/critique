<script setup lang="ts">
import BrandIconLight from "~/components/svg/BrandIconLight.vue";
import DashboardIcon from "~/components/svg/DashboardIcon.vue";
import AnalyticsIcon from "~/components/svg/AnalyticsIcon.vue";
import SettingsIcon from "~/components/svg/SettingsIcon.vue";
import BrandIcon from "~/components/svg/BrandIcon.vue";
import {useUiStore} from "~/stores/uiOptionStore";

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
    to: "/setting",
    component: SettingsIcon,
    caption: "Settings"
  },
]

const props = defineProps<{
  activate: "/dashboard" | "/analytic" | "/dashboard/profile" | "/setting",
  postToggle?: () => void
}>();

const uiStore = useUiStore()

function toggle() {
  uiStore.toggleNav();
  props.postToggle && props.postToggle()
}
</script>

<template>
  <aside class="dashboard-aside" :class="{'dashboard-aside-minimized': uiStore.minimized}">
    <div class="aside-top">
      <BrandIcon :height="40" v-if="uiStore.minimized" style="padding-top: 20px;"
                 src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANGSURBVHgBnZZNSFRRFMfPuW+cmaJFGfQhQUHQhzVj6hh9WDmYw/gF2rIgsl20ahMkoQuZsVW0CVqU5EYiglYzQuKoiKSSaQoRWlhgUQtDSLLJ9+7p3MnRGX2Md+a/mPvufeee35xzz3nvIWSh5d7IeVPKagThQ6LDBLRHrSPgHAHOIslBi8zo1mDjqN1+1IHEeyKXJdEtNvbp2CPCe7Aw5ArWdmnDliKR/ZgHnQB0AXIQATyDvOU7W/yNn9VcZDLGbXlOTpUHchSn+pRbsosVZYS5LwRmhGX4Of55yBYEMOtyiAqsrP2SspauoUBgFzitl1JC07lo77Rai3d3e8kwu9m8ADSkQE4D/akgpQ2RYZ5s5d8ziNjfV1N1Qq25qqsneahgL18hR9DKvTW9bggekKY5u7pA8JOr8HQywkWO0GFYMb7cmS1oY2SWdXfd7nwhsG+wpvKQmm7jCF2Ifr6czxaUBqPWVsFRNNrYFAiDgXWBooTTqtopiNNp1cjZgNJgoxPDZ3nIt7UiKDBAxpJAd339DEnDzzU9zw2sBUqDmdI8msmQHecbKKMjDf9T6g4GPwpOqVPogdJgRGLfZsbEEZomV2ldxRE1d3FKdUFpMHbl1tyz10lGF2k+V21hAvCPzgZVDLhE9ZjIbI4wQjm3mbECkZT+M7FYorlDxceutvm8h0FTqzCLHBOgATobjSXOKFTiuUbCeIoEA+2+omLICrYYf8seF2ytCKZlHMuToHCp9wa/tDow8eqC3dyfvTrAVZi/v98kko/AJiIgGSjv6fmWiKiMIwJ4COkFssMiGQ2Xeo5owZQcv+EBD0upoPWpA4kdYFOJ/ETZIwH6wsWFhaADOxWL/eCU3VfX3FPTqaC2Ek+TSh1kKPkEUDiGQqXekk1hSovLop0PPQJ/cS0in+cmPy2egEZvscF2TnNvqKzwhM29zAr5jl8HEo91bNMd03ce/M1jUx/W1jIoXFZ0iSS9gCxBSXGEC9JBF1tGpsbUPOM3iHTACG/phFxF+NyK//qUnGr943CJ54oEvM1N5dWx5+oa4HNvbR6fGkhdzio9904eKzJNo0EIKifCfbz5IKdqWZ0PSZgEIYYthFctb96N2+3/B38BUYfm1GsgAAAAAElFTkSuQmCC"></BrandIcon>
      <BrandIconLight v-else :height="40" style="padding-top: 20px;"></BrandIconLight>
      <div class="functions">
        <template v-for="route in routes" :key="route.to">
          <NuxtLink class="function-tab" :to="route.to" :class="{active: activate === route.to}">
            <component :is="route.component"
                       width="20"
                       height="20"
                       :fill="activate === route.to ? '#ffffff' : '#809FB8'"></component>
            <span v-if="!uiStore.minimized">{{ route.caption }}</span>
          </NuxtLink>
        </template>
        <div class="function-tab" @click="toggle">
          <el-icon size="1.4rem"
                   style="translate: -2px 0">
            <el-icon-fold></el-icon-fold>
          </el-icon>
          <span v-if="!uiStore.minimized">Minimize Sidebar</span>
        </div>
      </div>
    </div>
    <div class="aside-footer" v-if="!uiStore.minimized">
      <span>© 2024 Critique</span>
      <span class="small">Enhancing reading comprehension<br>and critical analysis with AI.</span>
    </div>
  </aside>
</template>

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
  overflow: hidden;
  transition: width 0.3s ease-out;
}

.dashboard-aside.dashboard-aside-minimized {
  width: var(--aside-width-minimized);
}

.dashboard-aside-minimized .function-tab {
  padding-right: 10px;
}

.aside-footer {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: var(--dashboard-main-margin);
  white-space: nowrap;
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
  cursor: pointer;
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