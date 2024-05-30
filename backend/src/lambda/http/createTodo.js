import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
// import { getUserId } from '../../auth/utils.mjs'
import { getUserId } from '../utils.mjs';
import { createTodo } from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      origin: '*', // Allow all origins
      methods: 'GET,PUT,POST,DELETE,OPTIONS', // Allow these methods
      allowedHeaders: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token', // Allow these headers
      preflightContinue: true, // Continue on successful preflight request
    })
  )
  .handler(async (event) => {
    console.log('Processing event: ', event)
    const newTodo = JSON.parse(event.body)
    console.log('newImage', newTodo.name)


    if (!newTodo.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'ERROR: The name is empty.'
        })
      };
    }

    const newItem = await createTodo(newTodo, getUserId(event))
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: newItem
      })
    }
  })