<!-- Add Task Modal -->
<script setup lang="ts">
  const { $csrfFetch } = useNuxtApp()
  const isVisible = defineModel<boolean>()
  const props = defineProps<{
    boardId: string | string[],
    categories: CategoryType[],
    refresh: () => Promise<void>
  }>()

  // Form state variables
  const title = ref('')
  const description = ref('')
  const category = ref<string | null>(null)
  const showAddCategoryModal = ref(false)
  const disableSubmit = ref(false)
  const errorMessage = ref('')

  // Form submission
  // Check if the title and description are valid, and if so, 
  // send the data to ther server, then navigate to the task page.
  const submitForm = async () => {
    if (title.value == '') {
      errorMessage.value = 'Please enter a task title.'
      return
    } else if (title.value.length > 50) {
      errorMessage.value = 'Task ttitle is too long (maximum 50 characters).'
      return
    } else if (description.value.length > 2500) {
      errorMessage.value = 'Task description is too long (maximum 2500 characters).'
      return
    }
    
    disableSubmit.value = true
    try {
      const result = await $csrfFetch('/api/task/add', {
        method: 'POST',
        body: {
          boardId: props.boardId,
          title: title.value,
          description: description.value,
          categoryId: category.value
        }
      })
      navigateTo(`/board/${props.boardId}/task?taskId=${result.taskId}`)
    } catch (e) {
      disableSubmit.value = false
      fetchErrorHandler(e, errorMessage)
    }
  }

  // Reset form state when the modal is opened
  watch(isVisible, () => {
    if (isVisible.value) {
      title.value = ''
      description.value = ''
      disableSubmit.value = false
      errorMessage.value = ''
      category.value = null
    }
  })
</script>

<template>
  <LargeModal 
    v-model="isVisible"
    title="Add New Task"
    description="Fill out this form to add a new task."
  >
    <AddCategoryModal 
      v-model="showAddCategoryModal"
      :board-id="props.boardId"
      :categories="props.categories"
      :refresh="props.refresh"
      @added=" (id) => { category = id }"
    />
    <div class="w-full p-4">
      <div class="text-3xl font-bold pb-2">Add New Task</div>
      <form @submit.prevent="submitForm">
        <div class="pb-2">
          <label for="add-title" class="block pb-2 font-bold">Title (required)</label>
          <UInput 
            id="add-title"
            v-model="title" 
            required
            autocomplete="off"
            class="block w-full"
            size="lg"
            :ui="TEXT_INPUT_UI"
          />
          <CharLimit :str="title" :limit="50" :show-length="40" />
        </div>

        <div>
          <div class="block pb-2 font-bold">Category</div>
          <!-- Hidden select for screen readers -->
          <label class="sr-only" for="add-category">
            Select an existing category. To add a new category, click the "New Category" button below, and the new category you add will be automatically selected.
          </label>
          <select 
            id="add-category" 
            class="sr-only" 
            v-model="category"
          >
            <option :value="null">Uncategorised</option>
            <option 
              v-for="cat of props.categories" 
              :key="cat.categoryId"
              :value="cat.categoryId"
            >
              {{ cat.title }}
            </option>
          </select>
          <div class="flex flex-wrap gap-2 pb-4">
            <div>
              <UButton 
                type="button"
                variant="outline"
                color="neutral"
                :trailing-icon="category === null ? 'heroicons:check-16-solid' : undefined"
                :aria-checked="category === null ? 'true' : 'false'"
                :class="BUTTON_CATEGORY_CLASS"
                @click="() => { category = null }"
              >
                <div class="flex gap-2">
                  <CategoryIcon :colour="null" />
                  <div>Uncategorised</div>
                </div>
              </UButton>
            </div>
            <div 
              v-for="cat of props.categories" 
              :key="cat.categoryId"
            >
              <UButton 
                type="button"
                variant="outline"
                color="neutral"
                :trailing-icon="category === cat.categoryId ? 'heroicons:check-16-solid' : undefined"
                :aria-checked="category === cat.categoryId ? 'true' : 'false'"
                :class="BUTTON_CATEGORY_CLASS"
                @click="() => { category = cat.categoryId }"
              >
                <div class="flex gap-2">
                  <CategoryIcon :colour="cat.colour" />
                  <div>{{ cat.title }}</div>
                </div>
              </UButton>
            </div>
            <div v-if="categories.length < 8">
              <UButton 
                type="button"
                icon="heroicons:plus-16-solid"
                variant="outline"
                color="neutral"
                :class="BUTTON_CATEGORY_CLASS"
                @click="() => {showAddCategoryModal = true}"
              >
                New Category
              </UButton>
            </div>
          </div>
        </div>
        
        <div class="pb-2">
          <label for="add-description" class="block pb-2 font-bold">Description</label>
          <UTextarea
            id="add-description"
            v-model="description" 
            autocomplete="off"
            class="block w-full"
            :ui="TEXT_INPUT_UI"
          />
          <CharLimit :str="description" :limit="2500" :show-length="2250" />
        </div>

        <div class="pb-2">Dependencies for this task can be added after the task is added to the board.</div>
        <div class="pb-2 font-bold">This board can be opened by anyone on the internet with this board's board code or a link to this board. Do not put anything sensitive in the task title or description.</div>
        <div class="flex gap-2 sm:gap-4">
          <div>
            <UButton 
              type="submit"
              icon="heroicons:document-plus-16-solid"
              :loading="disableSubmit"
              :class="BUTTON_SOLID_CLASS"
            >
              Add Task
            </UButton>
          </div>
          <div>
            <UButton 
              type="button"
              color="neutral"
              variant="ghost"
              icon="heroicons:x-mark-16-solid"
              :class="BUTTON_GHOST_CLASS"
              @click="() => {isVisible = false}"
            >
              Cancel
            </UButton>
          </div>
        </div>
      </form>
      <FormError :message="errorMessage" />
    </div>
  </LargeModal>
</template>
