<script setup lang="ts">
import MenuFrame from "~/components/general/MenuFrame.vue";
import MenuEntry from "~/components/general/MenuEntry.vue";
import ContextMenu from "~/components/general/ContextMenu.vue";
import useEventBus from "~/composibles/useEventBus";
import DropDown from "~/components/general/DropDown.vue";
import { ElDropdownItem, ElDropdownMenu, ElIcon } from "#components";
import { ElIconMoreFilled } from "#imports";

const props = defineProps<{
    menuOptions: ContextMenuEntry[]
    iconClass?: string
}>()

const dropdownComponent = defineComponent({
    setup() {
        const showDots = ref(false)
        const eventBus = useEventBus()

        const menuOff = () => eventBus.emit("context-menu-off")

        return { showDots, menuOff }
    },
    render() {
        const iconChild = h(ElIconMoreFilled, { class: "text-emphasis" })
        const iconNode = h(
            ElIcon, {
                class: props.iconClass ?? '',
                onMouseenter: this.menuOff
            },
            {
                default: () => iconChild
            }
        )

        const dropdownItems = props.menuOptions.map((item) =>
            h(
                ElDropdownItem,
                {
                    key: item.text,
                    divided: item.divided,
                    icon: item.icon,
                    onClick: item.callback
                },
                {
                    default: () => item.text
                }
            )
        )

        const dropdownMenu = h(
            ElDropdownMenu,
            {
                onMouseenter: () => (this.showDots = true),
                onMouseleave: () => (this.showDots = false)
            },
            {
                default: () => dropdownItems
            }
        )

        return h(
            DropDown,
            {
                class: "cursor-pointer opacity-0 group-hover:opacity-100 flex-shrink-0",
                style: { opacity: this.showDots ? "100" : "" }
            },
            {
                default: () => iconNode,
                dropdown: () => dropdownMenu
            }
        )
    }
})

</script>

<template>
    <ContextMenu>
        <template #menu>
            <MenuFrame>
                <MenuEntry v-for="entry in menuOptions" :key="entry.text" :divided="entry.divided">
                    <template #icon>
                        <component :is="entry.icon" class="w-[1.2em] h-[1.2em]"/>
                    </template>
                    <span>{{ entry.text }}</span>
                </MenuEntry>
            </MenuFrame>
        </template>
        <slot :dropdown="dropdownComponent"/>
    </ContextMenu>
</template>

<style scoped>

</style>