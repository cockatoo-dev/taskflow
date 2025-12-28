<!-- Task list item component, used on the board page -->
<script setup lang="ts">
  const props = defineProps<{
    boardId: string,
    taskId: string,
    title: string,
    description: string,
    isComplete: boolean,
    numDeps: number,
    categoryTitle: string | null,
    categoryColour: string | null
  }>()
</script>

<template>
  <NuxtLink 
    class="group"
    :to="`/board/${boardId}/task?taskId=${taskId}`"
  >
    <UCard
      v-if="isComplete"
      :ui="{body: 'p-2 sm:p-2 lg:p-4'}"
      class="lg:h-56 bg-green-600 dark:bg-green-400 group-hover:bg-green-500 text-slate-100 dark:text-slate-900 transition-colors"
    >
      <div class="flex gap-2 leading-5">
        <div>
          <UIcon name="heroicons:check-circle-16-solid" class="h-5 w-5" />
        </div>
        <div class="text-sm font-bold tracking-wider">COMPLETED</div>
      </div>

      <h3
        class="lg:max-h-8 line-clamp-1 overflow-ellipsis text-2xl font-bold group-hover:underline group-focus:underline"
        :title="$props.title"
      >
        {{ props.title }}
      </h3>

      <div class="pt-2 pb-1">
        <div class="flex gap-2 px-2 py-1 rounded-sm ring-1 ring-slate-200 dark:ring-slate-800 w-fit">
          <CategoryIcon :colour="props.categoryColour" />
          <div class="">{{ props.categoryTitle || 'Uncategorised' }}</div>
        </div>
      </div>

      <p class="lg:h-24 line-clamp-2 lg:line-clamp-4 overflow-ellipsis">
        {{ props.description }}
      </p>
    </UCard>
    <UCard
      v-else-if="numDeps <= 0"
      :ui="{body: 'p-2 sm:p-2 lg:p-4'}"
      class="lg:h-56 bg-blue-600 dark:bg-blue-400 group-hover:bg-blue-500 text-slate-100 dark:text-slate-900 transition-colors"
    >
      <div class="flex gap-2 leading-5">
        <div>
          <UIcon name="heroicons:play-circle-16-solid" class="h-5 w-5" />
        </div>
        <div class="text-sm font-bold tracking-wider">READY</div>
      </div>

      <h3
        class="lg:max-h-8 line-clamp-1 overflow-ellipsis text-2xl font-bold group-hover:underline group-focus:underline"
        :title="$props.title"
      >
        {{ props.title }}
      </h3>

      <div class="pt-2 pb-1">
        <div class="flex gap-2 px-2 py-1 rounded-sm ring-1 ring-slate-200 dark:ring-slate-800 w-fit">
          <CategoryIcon :colour="props.categoryColour" />
          <div class="">{{ props.categoryTitle || 'Uncategorised' }}</div>
        </div>
      </div>

      <p class="lg:h-24 line-clamp-2 lg:line-clamp-4 overflow-ellipsis">
        {{ props.description }}
      </p>
    </UCard>
    <UCard
      v-else
      :ui="{body: 'p-2 sm:p-2 lg:p-4'}"
      class="lg:h-56 bg-red-600 dark:bg-red-400 group-hover:bg-red-500 text-slate-100 dark:text-slate-900 transition-colors"
    >
      <div class="flex gap-2 leading-5">
        <div>
          <UIcon name="heroicons:clock-16-solid" class="h-5 w-5" />
        </div>
        <div class="text-sm font-bold tracking-wider">NOT READY</div>
      </div>

      <h3
        class="lg:max-h-8 line-clamp-1 overflow-ellipsis text-2xl font-bold group-hover:underline group-focus:underline"
        :title="$props.title"
      >
        {{ props.title }}
      </h3>

      <div class="pt-2 pb-1">
        <div class="flex gap-2 px-2 py-1 rounded-sm ring-1 ring-slate-200 dark:ring-slate-800 w-fit">
          <CategoryIcon :colour="props.categoryColour" />
          <div class="">{{ props.categoryTitle || 'Uncategorised' }}</div>
        </div>
      </div>

      <p class="lg:h-24 line-clamp-2 lg:line-clamp-4 overflow-ellipsis">
        {{ props.description }}
      </p>
    </UCard>
  </NuxtLink>
</template>
