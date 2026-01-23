import { z } from "zod"
import { useDB } from "~~/server/db/db"

const bodySchema = z.object({
  boardId: z.string(),
  taskId: z.string(),
  title: z.string(),
  description: z.string(),
  categoryId: z.string().nullable()
})

// POST /api/task/edit
// Edits a task on a board
export default defineEventHandler(async (e) => {
  try {
    await checkAPIWriteEnabled(e)

    const userId = await getUserId(e)
    
    const boydParse = await readValidatedBody(e, (b) => bodySchema.safeParse(b))
    const bodyData = checkParseResult(boydParse)

    if (bodyData.title == '') {
      throw badRequestError("Please enter a task title.")
    } else if (bodyData.title.length > 50) {
      throw badRequestError("Task title is too long (maximum 50 characters).")
    } else if (bodyData.description.length > 2500) {
      throw badRequestError("Task description is too long (maximum 2500 characters).")
    }

    const db = useDB(e)

    const boardInfo = await getBoardInfo(db, bodyData.boardId, userId)
    if (!canEdit(boardInfo.isOwner, boardInfo.publicPerms)) {
      throw forbiddenError("You do not have permission to edit tasks on this board.")
    }

    await checkTaskExists(db, bodyData.boardId, bodyData.taskId)

    await db.editTask(bodyData.taskId, bodyData.title, bodyData.description, bodyData.categoryId)
    setResponseStatus(e, 204)
  } catch (err) {
    handleError(err)
  }
})
