import { useDB } from "~~/server/db/db"

// DELETE /api/account/delete
// Deletes the user's account and all associated data.
export default defineEventHandler(async (e) => {
  try {
    await checkAPIWriteEnabled(e)
  
    const userId = await requireUserId(e)
    const db = useDB(e)
    await db.deleteUserBoards(userId)
    clearUserSession(e)
  } catch (err) {
    handleError(err)
  }
})
