// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: {enabled: true},
    modules: ["@nuxtjs/supabase", "@element-plus/nuxt", '@nuxtjs/color-mode', '@vesp/nuxt-fontawesome', '@vueuse/nuxt',],
    supabase: {
        redirect: false,
    },
    elementPlus: {
        themes: ['dark']
    },
    colorMode: {
        preference: "dark",
        fallback: "light",
        classSuffix: ''
    },
    app: {
        head: {
            charset: "utf-8",
            viewport: "width=device-width, initial-scale=1",
            link: [
                {rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png"},
                {rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png"},
                {rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png"},
                {rel: "manifest", href: "/site.webmanifest"},
            ],
            meta: [
                {name: "msapplication-TileColor", content: "#da532c"},
                {name: "theme-color", content: "#ffffff"}
            ]
        }
    }
})