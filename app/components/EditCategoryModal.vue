<script setup lang="ts">
  const { $csrfFetch } = useNuxtApp()
  const isVisible = defineModel<boolean>()
  const props = defineProps<{
    boardId: string | string[],
    categoryId: string | string[],
    categories: CategoryType[],
    refresh: () => Promise<void>
  }>()

  // Form state variables
  const title = ref("")
  const colour = ref("orange")
  const colourSelectOpen = ref(false)

  const errorMessage = ref("")
  const disableSubmit = ref(false)
  const colourOptions = computed(() => {
    const colours = new Set(CATEGORY_COLOURS)
    for (const cat of props.categories) {
      if (cat.categoryId !== props.categoryId && cat.colour !== null) {
        colours.delete(cat.colour)
      }
    }
    return Array.from(colours)
  })

  watch(() => props.categoryId, () => {
    const category = props.categories.find(cat => cat.categoryId === props.categoryId)
    console.log(props.categoryId)
    console.log(category)
    if (category) {
      title.value = category.title
      colour.value = category.colour
    }
  })

  const submit = async () => {
    colourSelectOpen.value = false
    if (title.value.length === 0) {
      errorMessage.value = "Category Name cannot be empty."
      return
    }
    if (title.value.length > 20) {
      errorMessage.value = "Category Name cannot exceed 20 characters."
      return
    }

    disableSubmit.value = true
    try {
      await $csrfFetch("/api/category/edit", {
        method: 'post',
        body: {
          boardId: props.boardId,
          categoryId: props.categoryId,
          title: title.value,
          colour: colour.value
        }
      })
      await props.refresh()
      isVisible.value = false
    } catch (error) {
      fetchErrorHandler(error, errorMessage)
    } finally {
      disableSubmit.value = false
    }
  }

  const deleteCategory = async () => {
    colourSelectOpen.value = false
    disableSubmit.value = true
    try {
      await $csrfFetch("/api/category/delete", {
        method: 'post',
        body: {
          boardId: props.boardId,
          categoryId: props.categoryId
        }
      })
      await props.refresh()
      isVisible.value = false
    } catch (error) {
      fetchErrorHandler(error, errorMessage)
    } finally {
      disableSubmit.value = false
    }
  }
</script>

<template>
  <SmallModal
    v-model="isVisible"
    title="Edit Category"
    description="Update the details for this category."
  >
    <div class="w-full p-4">
      <h4 class="text-xl font-bold pb-4">Edit Category</h4>
      <form @submit.prevent="submit">
        <div class="grid grid-cols-[auto_1fr] gap-2">
          <div>
            <label for="category-colour" class="sr-only">Category Colour</label>
            <!-- Hidden select for screen readers -->
            <select id="category-colour" class="sr-only" v-model="colour">
              <option 
                v-for="option in colourOptions" 
                :key="option" 
                :value="option"
              >
                {{ option }}
              </option>
            </select>
            <UPopover
              v-model:open="colourSelectOpen"
              :content="{align:'start'}"
            >
              <UButton
                variant="outline"
                color="neutral"
                aria-label="Select Category Colour"
                trailing-icon="heroicons:chevron-down-16-solid"
              >
                <CategoryIcon :colour="colour" />
              </UButton>
              
              <template #content>
                <div class="grid grid-cols-4 gap-2 p-2">
                  <div 
                    v-for="option in colourOptions" 
                    :key="option"
                  >
                    <UButton
                      type="button"
                      :variant="option === colour ? 'outline' : 'ghost'"
                      @click="() => { 
                        colour = option 
                        colourSelectOpen = false
                      }"
                    >
                      <CategoryIcon :colour="option" />
                    </UButton>
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
          <div>
            <label for="category-title" class="sr-only">Category Name</label>
            <UInput 
              id="category-title"
              v-model="title" 
              required
              autocomplete="off"
              class="block w-full"
              :ui="TEXT_INPUT_UI"
              placeholder="Category Name"
            />
            <CharLimit :str="title" :limit="20" :show-length="15" />
          </div>
        </div>
        <div class="flex flex-wrap gap-2 pt-2">
          <div>
            <UButton 
              type="submit"
              :loading="disableSubmit"
              icon="heroicons:check-16-solid"
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
          <div>
            <UButton 
              type="button"
              color="error"
              variant="ghost"
              icon="heroicons:trash-16-solid"
              :class="BUTTON_GHOST_CLASS"
              @click="deleteCategory"
            >
              Delete Category
            </UButton>
          </div>
        </div>
      </form>
      <FormError :message="errorMessage" />
    </div>
  </SmallModal>
</template>
