import z from "zod";
import { useDB } from "~~/server/db/db";

const bodySchema = z.object({
  boardId: z.string(),
  categoryId: z.string(),
  title: z.string(),
  colour: z.string()
})

// POST /api/board/category/edit
// Edits an existing category on a board
export default defineEventHandler(async (e) => {
  try {
    await checkAPIWriteEnabled(e)
  
    const bodyParse = await readValidatedBody(e, (b) => bodySchema.safeParse(b))
    const bodyData = checkParseResult(bodyParse)
    if (bodyData.title === "") {
      throw badRequestError('Category Title is required.')
    } else if (bodyData.title.length > 20) {
      throw badRequestError('Category Title is too long (maximum 20 characters).')
    } else if (!isValidCategoryColour(bodyData.colour)) {
      throw badRequestError('Invalid Category Colour.')
    }

    const userId = await getUserId(e)
    const db = useDB(e)
    const boardInfo = await getBoardInfo(db, bodyData.boardId, userId)
    if (!canEdit(boardInfo.isOwner, boardInfo.publicPerms)) {
      throw forbiddenError('You do not have permission to modify this board.')
    }
    const existingColour = boardInfo.categories.find(cat => cat.categoryId === bodyData.categoryId)?.colour || null
    if (bodyData.colour !== existingColour && !isAvailableCategoryColour(bodyData.colour, boardInfo.categories)) {
      throw badRequestError('Another category is already using this colour. Please choose a different colour.')
    }
    
    await db.editCategory(bodyData.categoryId, bodyData.title, bodyData.colour)
    setResponseStatus(e, 204)
  } catch (err) {
    handleError(err)
  }
})
