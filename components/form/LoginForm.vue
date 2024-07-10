<script setup lang="ts">
defineProps<{
  model: {
    email: string,
    password: string
  }
}>()
</script>

<template>
  <el-form :model="model" label-width="auto" class="form">
    <el-form-item label="Email">
      <el-input v-model="model.email" class="form-element"/>
    </el-form-item>
    <el-form-item label="Password">
      <el-input type="password" show-password v-model="model.password" class="form-element"/>
    </el-form-item>
    <el-form-item class="submit-button-wrapper">
      <el-button type="primary" @click="$emit('login')" plain  class="submit-button">Sign In</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
:deep(.submit-button-wrapper .el-form-item__content) {
  width: 100%;
  flex-direction: row-reverse;
}

.form-element {
  height: 35px;
}
</style>