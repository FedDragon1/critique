import { defineStore } from 'pinia'

export const useFileStore = defineStore('file', {
    state: () => ({
        ocrResult: null as string | null
    }),
    actions: {
        setOcrResult(to: string) {
            this.$patch(state => state.ocrResult = to)
        }
    }
})