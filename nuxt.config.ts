// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-16',
  devtools: { enabled: true },

  nitro: {
    preset: "cloudflare_module",

    cloudflare: {
      deployConfig: false,
      // nodeCompat: true
    }
  },

  modules: [
    "nitro-cloudflare-dev",
    "@nuxt/eslint",
    "nuxt-security",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "nuxt-auth-utils"
  ],

  css: ['~/assets/style.css'],
  
  fonts: {
    families: [
      {name: 'Open Sans', provider: 'google', weights: [400, 700], styles: ['normal', 'italic']},
      {name: 'Apple Color Emoji', provider: 'none'},
      {name: 'Segoe UI Emoji', provider: 'none'},
      {name: 'Segoe UI Symbol', provider: 'none'},
      {name: 'Noto Color Emoji', provider: 'none'},
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
    '/api/_auth/session': {csurf: false}
  }
})