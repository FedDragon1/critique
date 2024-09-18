import { defineStore } from 'pinia'

export const useFileStore = defineStore('file', {
    state: () => ({
        ocrResult: null as OcrResult | null
    }),
    actions: {
        setOcrResult(to: OcrResult) {
            this.$patch(state => state.ocrResult = to)
        }
    }
})