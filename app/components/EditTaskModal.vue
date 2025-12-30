<!-- Edit Task Modal, used on the task page -->
<script setup lang="ts">
  const { $csrfFetch } = useNuxtApp()
  
  const isVisible = defineModel<boolean>()
  const props = defineProps<{
    title: string,
    description: string,
    categoryId: string | null,
    categories: CategoryType[],
    refresh: () => Promise<void>
  }>()

  const route = useRoute()

  // Form state variables
  const editTitle = ref('')
  const editDescription = ref('')
  const editCategory = ref<string | null>(null)
  const showAddCategoryModal = ref(false)
  const disableSubmit = ref(false)
  const errorMessage = ref('')

  // Reset form state when the modal is opened
  watch(isVisible, () => {
    if (isVisible.value) {
      editTitle.value = props.title
      editDescription.value = props.description
      editCategory.value = props.categoryId
      errorMessage.value = ''
      disableSubmit.value = false
    }
  })

  // Form submission
  // Check if the title and description are valid, and if so,
  // send the data to the server, then refresh the task data.
  const submitForm = async () => {
    if (editTitle.value == '') {
      errorMessage.value = 'Please enter a task title.'
      return
    } else if (editTitle.value.length > 50) {
      errorMessage.value = 'Task ttitle is too long (maximum 50 characters).'
      return
    } else if (editDescription.value.length > 2500) {
      errorMessage.value = 'Task description is too long (maximum 2500 characters).'
      return
    }
    
    disableSubmit.value = true
    try {
      await $csrfFetch('/api/task/edit', {
        method: 'POST',
        body: {
          boardId: route.params.boardId,
          taskId: route.query.taskId,
          title: editTitle.value,
          description: editDescription.value,
          categoryId: editCategory.value
        }
      })
      await props.refresh()
      isVisible.value = false
    } catch (e) {
      disableSubmit.value = false
      fetchErrorHandler(e, errorMessage)
    }
  }
</script>

<template>
  <LargeModal 
    v-model="isVisible"
    title="Edit Task Details"
    description="Edit the task title and descriptions."
  >
    <AddCategoryModal 
      v-model="showAddCategoryModal"
      :board-id="route.params.boardId || ''"
      :categories="props.categories"
      :refresh="props.refresh"
      @added="(id) => {editCategory = id}"
    />
    <div class="w-full p-4">
      <h3 class="text-3xl font-bold pb-2">Edit Task Details</h3>
      <form @submit.prevent="submitForm">
        <div class="pb-2">
          <label for="edit-title" class="block pb-2 font-bold">Title</label>
          <UInput 
            id="edit-title"
            v-model="editTitle" 
            required
            autocomplete="off"
            class="w-full"
            size="lg"
            :ui="TEXT_INPUT_UI"
          />
          <CharLimit :str="editTitle" :limit="50" :show-length="40" />
        </div>

        <div>
          <div class="block pb-2 font-bold">Category</div>
          <!-- Hidden select for screen readers -->
          <label class="sr-only" for="edit-category">
            Select an existing category. To add a new category, click the "New Category" button below, and the new category you add will be automatically selected.
          </label>
          <select 
            id="edit-category" 
            class="sr-only" 
            v-model="editCategory"
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
                :trailing-icon="editCategory === null ? 'heroicons:check-16-solid' : undefined"
                :aria-checked="editCategory === null ? 'true' : 'false'"
                :class="BUTTON_CATEGORY_CLASS"
                @click="() => { editCategory = null }"
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
                :trailing-icon="editCategory === cat.categoryId ? 'heroicons:check-16-solid' : undefined"
                :aria-checked="editCategory === cat.categoryId ? 'true' : 'false'"
                :class="BUTTON_CATEGORY_CLASS"
                @click="() => { editCategory = cat.categoryId }"
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
          <label for="edit-description" class="block pb-2 font-bold">Description</label>
          <UTextarea
            id="edit-description"
            v-model="editDescription" 
            autocomplete="off"
            class="w-full"
            :ui="TEXT_INPUT_UI"
          />
          <CharLimit :str="editDescription" :limit="2500" :show-length="2250" />
        </div>
        <div class="pb-2 font-bold">This board can be opened by anyone on the internet with this board's board code or a link to this board. Do not put anything sensitive in the task title or description.</div>
        <div class="flex gap-4">
          <div>
            <UButton 
              type="submit"
              icon="heroicons:document-check-16-solid"
              :loading="disableSubmit"
              :class="BUTTON_SOLID_CLASS"
            >
              Save Changes
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
