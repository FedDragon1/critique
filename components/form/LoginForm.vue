<script setup lang="ts">
import FormFrame from "~/components/login/FormFrame.vue";

defineProps<{
    model: {
        email: string,
        password: string,
        rememberMe: boolean
    }
}>()
</script>

<template>
    <FormFrame>
        <el-form :model="model" label-width="auto" class="form">
            <el-form-item label="Email address">
                <el-input v-model="model.email" class="form-element"/>
            </el-form-item>
            <el-form-item label="Password">
                <el-input type="password" show-password v-model="model.password" class="form-element"/>
            </el-form-item>
            <el-form-item>
                <el-checkbox label="Remember me" v-model="model.rememberMe" style="width: 100%"></el-checkbox>
            </el-form-item>
            <span>By continuing, you agree to the <u>Terms of use</u> and <u>Privacy Policy</u></span>
            <el-form-item class="submit-button-wrapper">
                <el-button @click="$emit('login')" plain type="primary" class="submit-button">Log in</el-button>
            </el-form-item>
        </el-form>
    </FormFrame>
</template>

<style scoped>
u {
    color: var(--el-text-color-primary)
}

u:hover {
    color: var(--el-color-primary)
}

.form-element {
    height: 50px;
}

span {
    line-height: 2.4rem;
}

.submit-button {
    width: 100%;
    height: 50px;
    border-radius: 25px;
    font-size: 1.2rem;
    background-color: var(--el-text-color-disabled);
    color: white;
    border: 1px solid transparent;
}

.submit-button:hover {
    background-color: var(--el-color-primary)
}
</style>