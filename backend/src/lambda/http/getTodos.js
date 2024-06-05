import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs';
import { getToDosByUserId } from '../../businessLogic/todosBiz.mjs'

const logger = createLogger('getTodos')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      origin: '*', // Allow all origins
    })
  )
  .handler(async (event) => {
    logger.info(`Processing event: ${event}`, {function: "handler()"})

    const userId = await getUserId(event)
    logger.info(`userId: ${userId}`, {function: "handler()"})

    const todos = await getToDosByUserId(userId)

    const items = todos.Items
    logger.info(`todos: ${todos}`, {function: "handler()"})
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items
      })
    }
  })