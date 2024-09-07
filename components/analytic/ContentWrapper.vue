<script setup lang="ts">

import DocumentNav from "~/components/analytic/DocumentNav.vue";
</script>

<template>
  <div class="content-wrapper">
    <DocumentNav></DocumentNav>
    <div class="content-scroll-clip">
      <div class="content">
        <slot/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-scroll-clip {
  width: 100%;
  overflow: auto;
  flex-grow: 999;
}

.content {
  min-width: 600px;
}

.content-wrapper {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease-in-out;
}
</style>