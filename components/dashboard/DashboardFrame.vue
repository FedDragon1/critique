<script setup lang="ts">
import DashboardAside from "~/components/dashboard/DashboardAside.vue";

defineOptions({
    inheritAttrs: false
})

const attrs = useAttrs();
const props = defineProps<{
    padding?: string,
    activate: "/dashboard" | "/analytic" | "/setting",
    postToggle?: () => void
}>();

const main = useTemplateRef<HTMLDivElement>("main");

onMounted(() => {
    if (props.padding) {
        main.value?.style.setProperty("--dashboard-main-padding", props.padding)
    }
})

defineExpose({
    element: main
})
</script>

<template>
    <div class="h-screen w-screen overflow-hidden bg-background">
        <section class="w-full h-full box-border flex flex-1 min-w-0">
            <DashboardAside :activate="activate" :post-toggle="postToggle"></DashboardAside>
            <div class="w-full h-full overflow-y-auto" >
                <slot name="nav"/>
                <div class="w-full h-full" v-bind="attrs" ref="main">
                    <slot></slot>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
</style>