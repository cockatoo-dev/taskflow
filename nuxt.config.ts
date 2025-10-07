// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-16',
  devtools: { enabled: true },

  nitro: {
    preset: "cloudflare_module",

    cloudflare: {
      deployConfig: false,
    }
  },

  modules: [
    "@nuxt/eslint",
    "nuxt-security",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "nuxt-auth-utils"
  ],

  css: ['~/assets/style.css'],
  
  fonts: {
    families: [
      {name: 'Open Sans', provider: 'local', weights: [400, 700], styles: ['normal', 'italic']},
    ],
  },

  security: {
    corsHandler: false,
    csrf: true
  },
  csurf: {
    methodsToProtect: ['POST', 'PATCH', 'PUT', 'DELETE']
  },
  routeRules: {
    '/': {prerender: true},
    '/api/_auth/**': {csurf: false}
  }
})