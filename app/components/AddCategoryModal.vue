<script setup lang="ts">
  const { $csrfFetch } = useNuxtApp()
  const isVisible = defineModel<boolean>()
  const props = defineProps<{
    boardId: string | string[]
    categories: CategoryType[],
    refresh: () => Promise<void>
  }>()

  const emit = defineEmits<{
    (e: 'added', id: string): void
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
      if (cat.colour !== null) {
        colours.delete(cat.colour)
      }
    }
    return Array.from(colours)
  })

  watch(isVisible, () => {
    if (isVisible.value) {
      title.value = ''
      console.log(colourOptions.value)
      if (!colourOptions.value.includes(colour.value)) {
        colour.value = colourOptions.value[0] || "gray"
      }
    }
  })

  watch(() => props.categories, () => {
    
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
      const result = await $csrfFetch("/api/category/add", {
        method: 'post',
        body: {
          boardId: props.boardId,
          title: title.value,
          colour: colour.value
        }
      })
      await props.refresh()
      emit('added', result.categoryId)
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
    title="Add Category"
    description="Create a new category for organising your tasks."
  >
    <div class="w-full p-4">
      <h4 class="text-xl font-bold pb-4">Add a New Category</h4>
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
                      :variant="option === colour ? 'subtle' : 'ghost'"                    
                      color="neutral"
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
        <div class="font-bold">
          Do not use a category name that includes sensitive information.
        </div>
        <div class="flex gap-2 pt-2">
          <div>
            <UButton 
              type="submit"
              :loading="disableSubmit"
              icon="heroicons:plus-16-solid"
              :class="BUTTON_SOLID_CLASS"
            >
              Add Category
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
  </SmallModal>
</template>
