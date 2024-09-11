import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
    state: () => ({
        minimizedNav: false
    }),
    getters: {
        minimized(state) {
            return state.minimizedNav;
        },
    },
    actions: {
        toggleNav(to?: boolean) {
            this.$patch(state => state.minimizedNav = to ?? !state.minimizedNav)
        }
    }
})