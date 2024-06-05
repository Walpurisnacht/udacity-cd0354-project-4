import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs';
import { updateTodoByUserId } from '../../businessLogic/todosBiz.mjs'

const logger = createLogger('updateTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      origin: '*'
    })
  )
  .handler(async (event) => {
    logger.info(`Processing event: ${event}`, {function: "handler()"})

    const todoId = event.pathParameters.todoId    
    const updItem = JSON.parse(event.body)
    logger.info(`To-be update item: ${updItem}`, {function: "handler()"})

    const updatedItem = await updateTodoByUserId(updItem, todoId, getUserId(event))
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: updatedItem
      })
    }
  })