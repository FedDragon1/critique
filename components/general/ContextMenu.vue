<script setup lang="ts">
import useEventBus from "~/composibles/useEventBus";
import { v4 as uuid } from "uuid"

// tailwind default
const transitionTime = 150

const attrs = useAttrs()
const menuUuid = uuid()

const top = ref(0)
const left = ref(0)

const menu = useTemplateRef<HTMLDivElement>("menu")
const container = useTemplateRef<HTMLDivElement>("container")

function syncContextMenu(e: MouseEvent) {
    if (!menu.value || !container.value) {
        return
    }

    // check if click intersects with menu
    const { left: containerLeft, top: containerTop, width, height } = container.value.getBoundingClientRect()

    if (containerLeft > e.clientX || e.clientX > containerLeft + width ||
        containerTop > e.clientY || e.clientY > containerTop + height) {
        // outside the original bounding box
        return
    }

    menu.value.style.transitionDuration = "0ms"
    menu.value.style.display = ""
    menu.value.style.opacity = "0"

    menu.value!.style.transform = ""
    const { width: menuWidth, height: menuHeight } = menu.value!.getBoundingClientRect()

    let origin = "top"
    let newY = e.clientY
    if (e.clientY + menuHeight > window.innerHeight) {
        newY -= menuHeight
        origin = "bottom"
    }

    let newX = e.clientX
    if (e.clientX + menuWidth > window.innerWidth) {
        newX -= menuWidth
    }

    // initialize for animation
    menu.value.style.transform = "scaleY(0)"

    requestAnimationFrame(() => {
        menu.value!.style.transitionDuration = `${transitionTime}ms`
        menu.value!.style.transform = ""
        menu.value!.style.opacity = ""
        menu.value!.style.transformOrigin = origin

        top.value = newY
        left.value = newX

        // turn off other context menus
        eventBus.emit("context-menu-off", menuUuid)
    })
}

function hideIfNotSelf(id?: string) {
    if (id === menuUuid) {
        return
    }
    hideMenu()
}

function hideMenu() {
    if (!menu.value) {
        return
    }
    menu.value.style.opacity = "0"
    menu.value.style.transform = "scaleY(0)"
    setTimeout(() => {
        menu.value!.style.display = "none"
    }, transitionTime)
}

const eventBus = useEventBus()

onMounted(() => {
    hideMenu()
    eventBus.on("context-menu-off", hideIfNotSelf)
    document.addEventListener("click", hideMenu)
})

onBeforeUnmount(() => {
    eventBus.off("context-menu-off", hideIfNotSelf)
    document.removeEventListener("click", hideMenu)
})
</script>

<template>
    <div @contextmenu.prevent.stop="syncContextMenu" ref="container" v-bind="attrs">
        <slot />
    </div>
    <Teleport to="body">
        <div @click.stop
             @contextmenu.prevent="syncContextMenu"
             ref="menu"
             :style="{ top: `${top}px`, left: `${left}px` }"
             class="fixed z-[2000] transition">
            <slot name="menu" />
        </div>
    </Teleport>
</template>

<style scoped>

</style>