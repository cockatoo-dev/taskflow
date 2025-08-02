export default defineAppConfig({
  ui: {
    colors: {
      primary: 'teal',
      secondary: 'amber',
      gray: 'slate'
    },
    toast: {
      slots: {
        title: 'text-base font-bold text-slate-800 dark:text-slate-200',
        description: 'text-base font-normal text-slate-800 dark:text-slate-200'
      }
    },
    icons: {
      loading: 'heroicons:arrow-path-16-solid',
    }
  }
})

