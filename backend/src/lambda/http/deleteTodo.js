import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs';
import { deleteTodo } from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      origin: '*', // Allow all origins
    })
  )
  .handler(async event => {
    console.log('Processing event: ', event)
    const todoId = event.pathParameters.todoId
    
    const deletedTodo = await deleteTodo(todoId, getUserId(event))
    return {
      statusCode: 200
    }
  })

