import z from "zod";
import { useDB } from "~~/server/db/db";

const bodySchema = z.object({
  boardId: z.string(),
  title: z.string(),
  colour: z.string()
})

// POST /api/board/category/add
// Adds a new category to a board
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
    if (!isAvailableCategoryColour(bodyData.colour, boardInfo.categories)) {
      throw badRequestError('Another category is already using this colour. Please choose a different colour.')
    }

    const categoryId = crypto.randomUUID()
    await db.addCategory(categoryId, bodyData.boardId, bodyData.title, bodyData.colour)

    return { categoryId }
  } catch (err) {
    handleError(err)
  }
})
