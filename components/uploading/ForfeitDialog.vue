<script setup lang="ts">
const props = defineProps<{
    returning: boolean
    beforeClose: () => any
}>()

const ret = ref(false)
watch(() => props.returning, () => ret.value = props.returning)
</script>

<template>
    <el-dialog v-model="ret"
               title="Warning"
               width="500"
               :before-close="beforeClose">
        <span>Are you sure you want to discard this file?</span><br>
        <span>You cannot undo this operation.</span>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="$emit('cancel')">Cancel</el-button>
                <el-button @click="$emit('confirm')" type="danger">Confirm</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>

</style>