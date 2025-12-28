<script setup lang="ts">
  const route = useRoute()

  let refreshInterval: ReturnType<typeof setTimeout>
  const { data, error, refresh } = useFetch("/api/tasks", {
    query: {boardId: route.params.boardId},
    method: 'get'
  })

  // State variables
  const searchValue = ref('')
  const categorySelectOpen = ref(false)
  const categoryFilter = ref<string | null>(null)
  const showBoardSettings = ref(false)
  const showBoardInvite = ref(false)
  const showAddTask = ref(false)

  // Show invalid board modal if the board ID is invalid
  const showInvalidBoard = computed(() => {
    if (!error.value) {
      return false
    } else if (
      error.value.data.statusCode === 400 &&
      error.value.data.message === 'Invalid board ID.'
    ) {
      return true
    } else {
      return false
    }
  })

  // Dynamic page title
  const pageTitle = computed(() => {
    if (!data.value) {
      return 'Taskflow'
    } else {
      return `${data.value.board.title} | Taskflow`
    }
  })
  useHead({
    title: pageTitle
  })
  useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: 'Task tracking for keeping your team coordinated.',
    ogDescription: 'Task tracking for keeping your team coordinated.'
  })

  const categoryOptions = computed(() => {
    type CategoryOptionType = {
      label: string
      value: string | null
      colour: string | null
    }
    const result: CategoryOptionType[] = [
      {
        label: 'All Categories',
        value: 'all',
        colour: null
      },
      {
        label: 'Uncategorised',
        value: null,
        colour: null
      }
    ]
    if (data.value) {
      for (const i of data.value.board.categories) {
        result.push({
          label: i.title,
          value: i.categoryId,
          colour: i.colour
        })
      }
    }
    return result
  })

  const selectedCategoryOption = computed(() => {
    return categoryOptions.value.find(opt => opt.value === categoryFilter.value)
  })

  // Generate sorted array of tasks to be displayed, which
  // is filtered by the search value 
  const displayTasks = computed(() => {
    if (!data.value) {
      return []
    }
    const sorted = [...data.value.tasks]
    sorted.sort((a, b) => {
      return taskSortNum(b.isComplete, b.numDeps) - taskSortNum(a.isComplete, a.numDeps)
    })
    const result: typeof sorted = []
    for (const i of sorted) {
      if (
        (categoryFilter.value === 'all' || i.categoryId === categoryFilter.value) &&
        (i.title.toLowerCase().includes(searchValue.value.toLowerCase()) ||
        i.description.toLowerCase().includes(searchValue.value.toLowerCase()))
      ) {
        result.push(i)
      }
    }
    return result
  })

  const resetSearch = () => {
    searchValue.value = ''
    categoryFilter.value = 'all'
  }

  // Generate board statistics
  // - complete: number of tasks that are complete
  // - ready: number of tasks that are not complete but have no dependencies
  // - notReady: number of tasks that are not complete and have dependencies
  // - percent: percentage of tasks that are complete
  const stats = computed(() => {
    const result = {
      complete: 0,
      ready: 0,
      notReady: 0,
      percent: 0,
    }
    
    if (!data.value) {
      return result
    }
    
    for (const i of data.value.tasks) {
      if (i.isComplete) {
        result.complete += 1
      } else if (i.numDeps <= 0) {
        result.ready += 1
      } else {
        result.notReady += 1
      }
    }
    result.percent = Math.floor(result.complete / data.value.tasks.length * 100)
    return result
  })

  // Refresh data if there is no error
  const intervalRefresh = () => {
    if (!error.value) {
      refresh()
    }
  }

  // Automatically refresh data every 20 seconds.
  onMounted(() => {
    refreshInterval = setInterval(intervalRefresh, 20000)
  })
  onUnmounted(() => {
    clearInterval(refreshInterval)
  })
</script>

<template>
  <div>
    <NavBar />
    <InvalidBoardModal v-model="showInvalidBoard" />
    <main 
      v-if="data"
      class="w-full min-w-80 sm:grid sm:grid-cols-[50%_50%] lg:grid-cols-[67%_33%] 2xl:grid-cols-[75%_25%]"
    >
      <BoardSettingsModal 
        v-model="showBoardSettings"
        :board-id="$route.params.boardId || ''"
        :title="data.board.title || ''"
        :public-perms="data.board.publicPerms || 0"
        :is-owner="data.board.isOwner || false"
        :categories="data.board.categories"
        :refresh
      />
      <BoardInviteModal v-model="showBoardInvite" />
      <AddTaskModal 
        v-model="showAddTask" 
        :board-id="route.params.boardId || ''" 
        :categories="data.board.categories" 
        :refresh="refresh" 
      /> 
      <div class="w-full h-full">
        <div class="h-10 px-2 py-1 grid grid-cols-[1fr_auto]">
          <h1 class="px-1 pt-1.5 lg:pt-0.5 lg:text-2xl text-center font-bold line-clamp-1 overflow-ellipsis">
            {{ data.board.title }}
          </h1>
          <div v-if="canEdit(data.board)">
            <div class="block lg:hidden">
              <UDropdownMenu
                :items="[
                  [{
                    label: 'Board Settings',
                    icon: 'heroicons:wrench-16-solid',
                    color: 'primary',
                    onSelect: () => {showBoardSettings = true}
                  }],
                  [{
                    label: 'Invite to Board',
                    icon: 'heroicons:user-plus-16-solid',
                    color: 'primary',
                    onSelect: () => {showBoardInvite = true}
                  }]
                ]"
                :content="{align:'end'}"
                :ui="DROPDOWN_UI"
              >
                <UButton 
                  type="button"
                  icon="heroicons:ellipsis-vertical-16-solid"
                  variant="ghost"
                  :class="BUTTON_GHOST_CLASS"
                >
                  Options
                </UButton>
              </UDropdownMenu>
            </div>
            <div class="hidden lg:flex gap-1">
              <UButton 
                type="button"
                icon="heroicons:wrench-16-solid"
                variant="ghost"
                :class="BUTTON_GHOST_CLASS"
                @click="() => {showBoardSettings = true}"
              >
                Board Settings
              </UButton>
              <UButton 
                type="button"
                label="Invite to Board"
                icon="heroicons:user-plus-16-solid"
                variant="ghost"
                :class="BUTTON_GHOST_CLASS"
                @click="() => {showBoardInvite = true}"
              >
                Invite to Board
              </UButton>
            </div>
          </div>
          <div v-else>
            <UButton 
              type="button"
              icon="heroicons:user-plus-16-solid"
              variant="ghost"
              :class="BUTTON_GHOST_CLASS"
              @click="() => {showBoardInvite = true}"
            >
              Invite to Board
            </UButton>
          </div>
        </div>
        
        <div 
          v-if="canEdit(data.board)"
          class="h-10 px-2 py-1 grid grid-cols-[1fr_auto]"
        >
          <h2 class="pl-2 pt-0.5 leading-8 text-2xl">Current Tasks</h2>
          <UButton 
            type="button"
            icon="heroicons:plus-16-solid"
            :class="BUTTON_SOLID_CLASS"
            @click="() => {showAddTask = true}"
          >
            Add Task
          </UButton>
        </div>
        <div v-else class="h-10 p-1">
          <h2 class="pl-2 pt-0.5 leading-8 text-2xl">Current Tasks</h2>
        </div>

        <div class="px-2 py-1 md:grid md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-1">
          <div class="max-md:pb-1">
            <label class="sr-only" for="tasks-search">Search for a task. The list of tasks will update automatically.</label>
            <UInput 
              id="tasks-search"
              v-model="searchValue"
              autocomplete="off"
              variant="outline"
              icon="heroicons:magnifying-glass-16-solid"
              placeholder="Search for a task..."
              class="w-full"
              :ui="TEXT_INPUT_UI"
            />
          </div>
          <div>
            <label class="sr-only" for="category-filter">Filter tasks by category. The list of tasks will update automatically.</label>
            <!-- Hidden select for accessibility -->
            <select
              id="category-filter"
              v-model="categoryFilter"
              class="sr-only"
            >
              <option 
                v-for="option in categoryOptions" 
                :key="option.value || 'uncategorized'"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <UPopover v-model:open="categorySelectOpen">
              <UButton
                id="category-filter"
                variant="outline"
                color="neutral"
                :class="BUTTON_GHOST_CLASS + ' w-full'"
                trailing-icon="heroicons:chevron-down-16-solid"
              >
                <div v-if="categoryFilter === 'all'" class="w-full text-left">All Categories</div>
                <div v-else class="w-full flex gap-2">
                  <CategoryIcon :colour="selectedCategoryOption?.colour || null" />
                  <div class="line-clamp-1 text-ellipsis">{{ selectedCategoryOption?.label || 'Uncategorized' }}</div>
                </div>
              </UButton>
              <template #content>
                <div class="w-[calc(100vw-1rem)] sm:w-[calc(50vw-1rem)] md:w-[calc(25vw-1rem)] lg:w-[calc((100vw-2rem)/4)] grid grid-cols-1 gap-1 p-1">
                  <div 
                    v-for="option in categoryOptions" 
                    :key="option.value || 'uncategorized'"
                  >
                    <UButton
                      type="button"
                      color="neutral"
                      :variant="selectedCategoryOption?.value === option.value ? 'subtle' : 'ghost'"
                      :class="BUTTON_GHOST_CLASS + ' w-full'"
                      :trailing-icon="selectedCategoryOption?.value === option.value ? 'heroicons:check-16-solid' : null"
                      @click="() => {
                        categoryFilter = option.value;
                        categorySelectOpen = false;
                      }"
                    >
                      <div v-if="option.value === 'all'" class="w-full text-left">All Categories</div>
                      <div v-else class="w-full flex gap-2">
                        <CategoryIcon :colour="option.colour || null" />
                        <div class="line-clamp-1 text-ellipsis">{{ option.label || 'Uncategorized' }}</div>
                      </div>
                    </UButton>
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
        </div>
        <ul
          v-if="displayTasks.length > 0" 
          class="lg:grid lg:grid-cols-2 2xl:grid-cols-3 p-2 lg:p-4 lg:gap-4 max-h-[calc(100vh-13.25rem)] md:max-h-[calc(100vh-10.75rem)] overflow-y-auto list-none m-0"
        >
          <li 
            v-for="item of displayTasks" 
            :key="item.taskId"
            class="max-lg:pb-2 m-0"
          >
            <TaskListItem
              :board-id="item.boardId"
              :task-id="item.taskId"
              :title="item.title"
              :description="item.description"
              :is-complete="item.isComplete"
              :num-deps="item.numDeps"
              :category-title="item.categoryTitle"
              :category-colour="item.categoryColour"
            />
          </li>
        </ul>
        <div v-else-if="data && data.tasks.length > 0">
          <h3 class="font-bold text-3xl text-center pt-8 pb-4">
            No tasks found.
          </h3>
          <div class="text-center">
            <UButton 
              type="button"
              variant="ghost"
              icon="heroicons:arrow-path-16-solid"
              :class="BUTTON_GHOST_CLASS"
              @click="resetSearch"
            >
              Reset Search
            </UButton>
          </div>
        </div>
        <div v-else class="pt-8">
          <h3 class="font-bold text-3xl text-center pt-8 pb-4">
            No tasks!
          </h3>
          <div class="text-center">
            <UButton 
              type="button"
              icon="heroicons:plus-16-solid"
              :class="BUTTON_SOLID_CLASS"
              @click="() => {showAddTask = true}"
            >
              Add a Task
            </UButton>
          </div>
        </div>
      </div>
      <div class="hidden sm:block w-full max-h-[calc(100vh-3rem)] overflow-y-auto p-1 lg:p-2">
        <div class="p-1 lg:p-2 text-center text-3xl">
          <div v-if="stats.percent < 100">
            <p>
              We're <span class="text-teal-600 dark:text-teal-400">{{ stats.percent }}%</span> of the way there!
            </p>
          </div>
          <div v-else>
            <p class="text-green-600 dark:text-green-400">We've made it. </p>
            <p class="text-green-600 dark:text-green-400">Great work, team!</p>
          </div>
        </div>
        <StatsChart
          :complete="stats.complete"
          :ready="stats.ready"
          :not-ready="stats.notReady"
        />
      </div>
    </main>
    <div v-else-if="error && !showInvalidBoard">
      <LoadingError :refresh />
    </div>
    <div v-else class="text-center font-bold text-xl pt-8">
      Loading...
    </div>
  </div>
</template>
