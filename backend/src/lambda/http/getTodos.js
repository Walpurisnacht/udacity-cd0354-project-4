import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
// import { parseUserId, getUserId } from '../../auth/utils.mjs'
import { getUserId } from '../utils.mjs';
import { getTodos } from '../../businessLogic/todos.mjs'
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'

const cloudwatch = new CloudWatchClient()

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
    const startTime = timeInMs()
    console.log('Processing event: ', event)

    // const authorization = event.headers.Authorization
    // const userId = await getUserId(authorization)
    const userId = await getUserId(event)
    console.log('userId', userId)
    const todos = await getTodos(userId)
    const items = todos.Items
    console.log('todos', todos)

    // Metric Cloud Watch
    let endTime = timeInMs()
  
    const totalTime = endTime - startTime  
    const latencyMetricCommand = new PutMetricDataCommand({
      MetricData: [
        {
          MetricName: 'Latency',
          Dimensions: [
            {
              Name: 'FunctionName',
              Value: 'GetTodos'
            }
          ],
          Unit: 'Milliseconds',
          Value: totalTime
        }
      ],
      Namespace: 'serverless-todo-app'
    })
    await cloudwatch.send(latencyMetricCommand)

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

function timeInMs() {
  return new Date().getTime()
}
