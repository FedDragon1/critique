<script setup lang="ts">
const attrs = useAttrs()

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

    menu.value.style.display = ""

    requestAnimationFrame(() => {
        const { width: menuWidth, height: menuHeight } = menu.value!.getBoundingClientRect()

        let newY = e.clientY
        if (e.clientY + menuHeight > window.innerHeight) {
            newY -= menuHeight
        }

        console.log(e.clientX, menuWidth, window.innerWidth)

        let newX = e.clientX
        if (e.clientX + menuWidth > window.innerWidth) {
            newX -= menuWidth
        }

        top.value = newY
        left.value = newX
    })
}

function hideMenu() {
    if (!menu.value) {
        return
    }
    menu.value.style.display = "none"
}
</script>

<template>
    <div @contextmenu.prevent="syncContextMenu" @click="hideMenu" ref="container" v-bind="attrs">
        <slot />
    </div>
    <Teleport to="body">
        <div @click.stop
             @contextmenu.prevent="syncContextMenu"
             ref="menu"
             :style="{ top: `${top}px`, left: `${left}px` }"
             class="fixed z-[2000]">
            <slot name="menu" />
        </div>
    </Teleport>
</template>

<style scoped>

</style>