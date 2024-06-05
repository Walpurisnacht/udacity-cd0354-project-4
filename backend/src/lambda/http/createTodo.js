import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs';
import { createTodoByUserId } from '../../businessLogic/todosBiz.mjs'

const logger = createLogger('createTodo')

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
    const newTodo = JSON.parse(event.body)

    if (!newTodo.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `ERROR: Todo's name cannot be empty!`
        })
      };
    }

    const newItem = await createTodoByUserId(newTodo, getUserId(event))
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: newItem
      })
    }
  })