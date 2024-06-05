import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs';
import { deleteTodoByUserId } from '../../businessLogic/todos.mjs'

const logger = createLogger('deleteTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      origin: '*', // Allow all origins
    })
  )
  .handler(async event => {
    logger.info(`Processing event: ${event}`, {function: "handler()"})
    const todoId = event.pathParameters.todoId
    
    const deletedTodo = await deleteTodoByUserId(todoId, getUserId(event))
    return {
      statusCode: 200
    }
  })

