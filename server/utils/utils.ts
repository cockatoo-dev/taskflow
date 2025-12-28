import type { z } from "zod";
import type { db } from "../db/db";
import type { H3Event } from "h3"

export const CATEGORY_COLOURS = [
  'orange',
  'yellow',
  'lime',
  'teal',
  'cyan',
  'violet',
  'fuchsia',
  'pink'
]
  

// Check if the API is enabled for read operations.
export const checkAPIReadEnabled = async (e: H3Event) => {
  const config = await e.context.cloudflare.env.CF_KV.get("workers_api")
  if (!config) {
    throw createError({
      status: 500,
      message: "API configuration is not set up correctly."
    })
  } else if (!config.includes("read")) {
    throw createError({
      status: 503,
      message: "The API is temporarily disabled. Please try again later."
    })
  } else {
    return
  }
}

// Check if the API is enabled for write operations.
export const checkAPIWriteEnabled = async (e: H3Event) => {
  const kvVal = await e.context.cloudflare.env.CF_KV.get("workers_api")
  if (!kvVal) {
    throw createError({
      status: 500,
      message: "API configuration is not set up correctly."
    })
  } else if (!kvVal.includes("write")) {
    throw createError({
      status: 503,
      message: "The API is temporarily disabled. Please try again later."
    })
  } else {
    return
  }
}

// Check the result of a zod parse. 
// If it fails, throw an error with a 400 status code
// and a message indicating that the request format is invalid.
// If it succeeds, return the parsed data.
// This is used to check the result of a zod parse in the API handlers.
export const checkParseResult = <T>(b: z.ZodSafeParseResult<T>) => {
  if (!b.success) {
    throw createError({
      status: 400,
      message: "Invalid request format"
    })
  } else {
    return b.data
  }
}

// Check if a task exists on a board.
export const checkTaskExists = async (db: db, boardId: string, taskId: string) => {
  if (!(await db.isTaskExists(boardId, taskId))) {
    throw createError({
      status: 400,
      message: "Invalid task ID"
    })
  }
}

// Check if a user has permission to mark a task as completed.
// Owner OR public permissions = 1 or 2
export const canSetComplete = (
  isOwner: boolean, publicPerms: number
) => {
  if (isOwner) {
    return true
  } else {
    return publicPerms >= 1
  }
}

// Check if a user has permission to edit tasks and board categories.
// Owner OR public permissions = 2
export const canEdit = (
  isOwner: boolean, publicPerms: number
) => {
  if (isOwner) {
    return true
  } else {
    return publicPerms === 2
  }
}

// Get information about a board.
// This includes the board ID, whether the user is the owner of the board,
// the title of the board, and the public permissions of the board.
export const getBoardInfo = async (db: db, boardId: string, userId: string | null) => {
  const dbData = await db.getBoard(boardId)
  if (dbData.length === 0) {
    throw createError({
      status: 400,
      message: 'Invalid board ID.'
    })
  } else {
    const categoriesList = []
    if (dbData[0].categoryId !== null) {
      for (const item of dbData) {
        categoriesList.push({
          categoryId: item.categoryId as string,
          title: item.categoryTitle as string,
          colour: item.categoryColour as string
        })
      }
    }

    return {
      boardId,
      isOwner: dbData[0].ownerId === userId,
      title: dbData[0].title,
      publicPerms: dbData[0].publicPerms,
      categories: categoriesList
    }
  }
}

export const isValidCategoryColour = (colour: string | null) => {
  if (colour === null) {
    return true
  } else {
    return CATEGORY_COLOURS.includes(colour)
  }
}

export const isAvailableCategoryColour = (colour: string, categories: {colour: string | null}[]) => {
  const colours = new Set(CATEGORY_COLOURS)
  for (const category of categories) {
    if (category.colour !== null) {
      colours.delete(category.colour)
    }
  }
  return colours.has(colour)
}

// Get the user ID from the session, 
// or null if the user is not logged in.
export const getUserId = async (e: H3Event) => {
  const session = await getUserSession(e)
  if (session.user) {
    // @ts-ignore
    return session.user.userId
  } else {
    return null
  }
}

// Get the user ID from the session, 
// or throw an error if the user is not logged in.
export const requireUserId = async (e: H3Event) => {
  const session = await requireUserSession(e)
  // @ts-ignore
  return session.user.userId
}
