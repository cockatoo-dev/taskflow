<script setup lang="ts">
  const props = defineProps<{
    colour: string | null
  }>()

  const categoryColourClass = computed(() => {
    if (props.colour === 'orange') {
      return 'bg-orange-400 dark:bg-orange-600'
    } else if (props.colour === 'yellow') {
      return 'bg-yellow-400 dark:bg-yellow-600'
    } else if (props.colour === 'lime') {
      return 'bg-lime-400 dark:bg-lime-600'
    } else if (props.colour === 'teal') {
      return 'bg-teal-400 dark:bg-teal-600'
    } else if (props.colour === 'cyan') {
      return 'bg-cyan-400 dark:bg-cyan-600'
    } else if (props.colour === 'violet') {
      return 'bg-violet-400 dark:bg-violet-600'
    } else if (props.colour === 'fuchsia') {
      return 'bg-fuchsia-400 dark:bg-fuchsia-600'
    } else if (props.colour === 'pink') {
      return 'bg-pink-400 dark:bg-pink-600'
    } else {
      return 'bg-slate-400 dark:bg-slate-600'
    }
  })
</script>

<template>
  <div class="py-1">
    <div :class="['h-4 w-4 rounded-full', categoryColourClass]" />
  </div>
</template>
