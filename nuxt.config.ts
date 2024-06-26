// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@element-plus/nuxt", '@nuxtjs/color-mode'],
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
  }
})