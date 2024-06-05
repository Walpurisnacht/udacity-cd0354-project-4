import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs';
import { getUploadUrlByUserId } from '../../businessLogic/todosBiz.mjs'

const logger = createLogger('generateUploadUrl')

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
    const todoId = event.pathParameters.todoId
    
    const uploadUrl = await getUploadUrlByUserId(todoId, getUserId(event))
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl
      })
    }
  })
