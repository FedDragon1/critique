<script setup lang="ts">
const props = defineProps<{
    scope: HTMLElement
}>()

const openMenu = ref(false)
const menu = useTemplateRef<HTMLDivElement>("menu")

const blurringEvents = ["keyup", "mousedown", "focus"]

function handleOpenMenu(e: MouseEvent) {
    e.preventDefault()

    // wait for dom to load
    requestAnimationFrame(() => {
        if (!menu.value) {
            return;
        }

        const { innerWidth, innerHeight } = window

        const maxX = e.clientX + menu.value.clientWidth
        const maxY = e.clientY + menu.value.clientHeight

        const x = maxX > innerWidth ? e.clientX - menu.value.clientWidth : e.clientX
        const y = maxY > innerHeight ? e.clientY - menu.value.clientHeight : e.clientY

        menu.value.style.setProperty("--top", `${y}px`);
        menu.value.style.setProperty("--left", `${x}px`);
    })

    openMenu.value = true
    blurringEvents.forEach(e => window.addEventListener(e, handleCloseMenu, true))
}

function handleCloseMenu() {
    setTimeout(() => openMenu.value = false, 100)
    blurringEvents.forEach(e => window.removeEventListener(e, handleCloseMenu, true))
}

watch(() => props.scope, () => props.scope?.addEventListener("contextmenu", handleOpenMenu))
onMounted(() => props.scope?.addEventListener("contextmenu", handleOpenMenu))
onBeforeUnmount(() => {
    handleCloseMenu()
    props.scope.removeEventListener("contextmenu", handleOpenMenu)
})
</script>

<template>
    <div class="context-menu-wrapper" ref="menu">
        <div class="content-menu" v-if="openMenu">
            <slot/>
        </div>
    </div>
</template>

<style scoped>
.context-menu-wrapper {
    position: fixed;
    --top: 0px;
    --left: 0px;
    left: var(--left);
    top: var(--top)
}
</style>