import z from "zod";
import { useDB } from "~~/server/db/db";

const bodySchema = z.object({
  boardId: z.string(),
  categoryId: z.string(),
})

export default defineEventHandler(async (e) => {
  await checkAPIWriteEnabled(e)
  
  const bodyParse = await readValidatedBody(e, (b) => bodySchema.safeParse(b))
  const bodyData = checkParseResult(bodyParse)

  const userId = await getUserId(e)
  const db = useDB(e)
  const boardInfo = await getBoardInfo(db, bodyData.boardId, userId)
  if (!canEdit(boardInfo.isOwner, boardInfo.publicPerms)) {
    throw createError({
      status: 403,
      message: 'You do not have permission to modify this board.'
    })
  }

  await db.deleteCategory(bodyData.categoryId)
})
