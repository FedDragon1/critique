<script setup lang="ts">
defineProps<{
  width?: number,
  height?: number
}>()

const attrs = useAttrs();
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1533.26 390.92" v-bind="attrs" :width="width" :height="height">
    <title>critique</title>
    <g id="icon">
      <path class="cls-1"
            d="M6452.21,7061.77l98.27,98.06,98.05-98.58s-35.7-34.94-96-35S6452.21,7061.77,6452.21,7061.77Z"
            transform="translate(-6395.92 -7026.25)"/>
      <path class="cls-2" d="M6431.44,7279.24,6529.5,7181l-98.58-98s-35,30.43-35,96S6431.44,7279.24,6431.44,7279.24Z"
            transform="translate(-6395.92 -7026.25)"/>
      <path class="cls-3"
            d="M6648.53,7299.43l-98.27-98.06L6452.21,7300s37.65,36.34,98.16,36.34S6648.53,7299.43,6648.53,7299.43Z"
            transform="translate(-6395.92 -7026.25)"/>
    </g>
  </svg>
</template>

<style scoped>
svg {
  width: fit-content;
  height: fit-content;
}

.cls-1 {
  fill: #f8bab4;
}

.cls-2 {
  fill: #c54c44;
}

.cls-3 {
  fill: #85332e;
}

.cls-4 {
  fill: #8b2018;
}

.cls-5 {
  fill: #fabcb5;
}

.cls-6 {
  fill: #8d2119;
}

.cls-7 {
  fill: #c64d45;
}

.cls-8 {
  fill: #c9534b;
}

.cls-9 {
  fill: #fabcb6;
}
</style>