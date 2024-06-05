import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import * as uuid from 'uuid'
import AWS from 'aws-sdk'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todosAccess')

export class TodosAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todoTable = process.env.TODOS_TABLE,
    userIdIndex = process.env.TODOS_CREATED_AT_INDEX,
    bucketName = process.env.IMG_S3_BUCKET,
    urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    s3 = new AWS.S3({
      signatureVersion: 'v4'
    })
  ) {
    this.documentClient = documentClient
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
    this.todoTable = todoTable
    this.userIdIndex = userIdIndex
    this.bucketName = bucketName
    this.urlExpiration = urlExpiration
    this.s3 = s3
  }

  // Get list of Todos by userId
  async getToDosByUserId(userId) {
    logger.info(`Getting all Todos by userId: ${userId}`, {function: "getToDosByUserId"})
    const result = await this.dynamoDbClient.query({
      TableName: this.todoTable,
      IndexName: this.userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    })
    logger.info(`getToDosByUserId result: ${result}`, {function: "getToDosByUserId"})
    return result
  }

  // Create a Todo by userId
  async createTodoByUserId(newTodo, userId) {
    const todoId = uuid.v4()
    const timestamp = new Date().toISOString()
    const newTodoRecord = {
      userId: userId,
      todoId: todoId,
      createdAt: timestamp,
      done: false,
      ...newTodo
    }
    logger.info(`Create new Todo: ${newTodoRecord}`, {function: "createTodoByUserId()"})
    logger.info(`New Todo's todoId: ${todoId}`, {function: "createTodoByUserId()"})
    const result = await this.dynamoDbClient.put({
      TableName: this.todoTable,
      Item: newTodoRecord
    })
    logger.info(`createTodoByUserId result: ${result}`, {function: "createTodoByUserId()"})
    return newTodo
  }

  // Update a Todo by userId
  async updateTodoByUserId(updatedTodo, todoId, userId) {
    logger.info(`Update Todo: ${updatedTodo}`, {function: "updateTodoByUserId()"})
    logger.info(`Update Todo's todoId: ${todoId}`, {function: "updateTodoByUserId()"})
    const result = await this.dynamoDbClient.update({
        TableName: this.todoTable,
        Key: {
          'userId' : userId,
          'todoId' : todoId
        },
        UpdateExpression: 'set #name=:name, #duedate=:dueDate, #done=:done',
        ExpressionAttributeNames: { '#name': 'name', '#duedate':'dueDate', '#done':'done'},
        ExpressionAttributeValues:{
            ":name": updatedTodo.name,
            ":dueDate": updatedTodo.dueDate,
            ":done": updatedTodo.done
        },
        ReturnValues: "UPDATED_NEW"
    })
    logger.info(`updateTodoByUserId result: ${result}`, {function: "updateTodoByUserId()"})
    return updatedTodo
  }

  // Delete a Todo by userId
  async deleteTodoByUserId(todoId, userId){
    logger.info(`Delete Todo's todoId: ${todoId}`, {function: "deleteTodoByUserId()"})
    const result = await this.dynamoDbClient.delete({
        TableName: this.todoTable,
        Key: {
          'userId' : userId,
          'todoId' : todoId
        },
        ReturnValues: "ALL_OLD"
    })
    logger.info(`deleteTodoByUserId result: ${result}`, {function: "deleteTodoByUserId()"})
    return result
  }
}
