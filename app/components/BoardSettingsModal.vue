<!-- Board Settings Modal, used on board page and account page -->
<script setup lang="ts">
  const { $csrfFetch } = useNuxtApp()
  const isVisible = defineModel<boolean>()
  const props = defineProps<{
    boardId: string | string[]
    title: string,
    publicPerms: number,
    isOwner: boolean,
    categories: CategoryType[],
    refresh: () => Promise<void>
  }>()

  const showAddCategoryModal = ref(false)
  const showEditCategoryModal = ref(false)
  const editingCategoryId = ref('')

  // Form state variables
  const titleEdit = ref("")
  const publicPermsEdit = ref("1")
  const errorMessage = ref("")
  const disableSubmit = ref(false)

  // Form submission
  // Check if the title is valid, and if so,
  // send the data to the server, then refresh the board.
  const submitForm = async () => {
    if (titleEdit.value.length > 50) {
      errorMessage.value = "Board Name is too long (maximum 50 characters)."
      return
    }

    disableSubmit.value = true
    try {
      await $csrfFetch("/api/board/edit", {
        method: 'post',
        body: {
          boardId: props.boardId,
          title: titleEdit.value,
          publicPerms: Number(publicPermsEdit.value)
        }
      })
      await props.refresh()
      isVisible.value = false
    } catch (e) {
      disableSubmit.value = false
      fetchErrorHandler(e, errorMessage)
    }
  }

  // Reset form state when the modal is opened
  watch(isVisible, () => {
    if (isVisible.value) {
      titleEdit.value = props.title
      publicPermsEdit.value = String(props.publicPerms)
      errorMessage.value = ''
      disableSubmit.value = false
    }
  })
</script>

<template>
  <LargeModal 
    v-model="isVisible"
    title="Board Settings"
    description="Update the settings for this board."
  >
    <AddCategoryModal 
      v-model="showAddCategoryModal"
      :board-id="props.boardId"
      :categories="categories"
      :refresh="props.refresh"
    />
    <EditCategoryModal 
      v-model="showEditCategoryModal"
      :board-id="props.boardId"
      :category-id="editingCategoryId"
      :categories="categories"
      :refresh="props.refresh"
    />
    <div class="w-full p-4 relative">
      <div class="absolute top-2 right-2">
        <UButton 
          type="button"
          color="neutral"
          icon="heroicons:x-mark-16-solid"
          variant="ghost"
          :class="BUTTON_GHOST_CLASS"
          @click="() => {isVisible = false}"
        >
          Close
        </UButton>
      </div>
      <div v-if="$route.path !== '/account'">
        <h3 class="text-3xl font-bold pb-2">Task Categories</h3>
        <div v-if="categories.length === 0" class="pb-2">
          <UButton 
            type="button"
            icon="heroicons:plus-16-solid"
            variant="ghost"
            :class="BUTTON_GHOST_CLASS"
            @click="() => {showAddCategoryModal = true}"
          >
            Add a Category
          </UButton>
        </div>
        <div v-else class="pb-2">
          <div class="sr-only">Select a category to edit or delete it.</div>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="category in categories" 
              :key="category.categoryId"
              class="flex gap-2"
            >
              <UButton
                type="button"
                variant="outline"
                color="neutral"
                :class="BUTTON_CATEGORY_CLASS"
                @click="() => { 
                  editingCategoryId = category.categoryId
                  console.log(editingCategoryId)
                  showEditCategoryModal = true
                }"
              >
                <div class="flex gap-2">
                  <CategoryIcon :colour="category.colour" />
                  <div>{{ category.title }}</div>
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
      </div>
      <div v-if="isOwner">
        <h3 v-if="isOwner" class="text-3xl font-bold py-2">Board Settings</h3>
        <form v-if="isOwner" @submit.prevent="submitForm">
          <div class="pb-2">
            <label for="settings-name" class="block pb-2 font-bold">Board Name</label>
            <UInput 
              id="settings-name"
              v-model="titleEdit" 
              required
              autocomplete="off"
              class="block w-full"
              :ui="TEXT_INPUT_UI"
            />
            <CharLimit :str="title" :limit="50" :show-length="40" />
          </div>
          <div class="pb-4">
            <PublicPermsRadio v-model="publicPermsEdit" />
          </div>
          <div class="flex gap-4">
            <div>
              <UButton 
                type="submit"
                icon="heroicons:check-16-solid"
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
        <div v-if="isOwner && $route.path !== '/account'" class="pt-2">
          If you are looking to delete this board, please go to your
          <NuxtLink to="/account" class="text-teal-600 dark:text-teal-400 hover:underline">
            account page.
          </NuxtLink>
        </div>
      </div>
    </div>
  </LargeModal>
</template>
