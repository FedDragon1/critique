<script setup lang="ts">
defineExpose({
    // @ts-ignore
    addEventListener: (...args: any[]) => frame.value?.addEventListener(...args),
    // @ts-ignore
    removeEventListener: (...args: any[]) => frame.value?.removeEventListener(...args),
})

const frame = useTemplateRef<HTMLDivElement>("frame");
</script>

<template>
    <div class="content-wrapper">
        <slot name="header"/>
        <div class="content-scroll-clip" ref="frame">
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
    display: flex;
}

.content-wrapper {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: width 0.2s ease-in-out;
    flex-grow: 999;
}
</style>