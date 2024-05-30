import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import * as uuid from 'uuid'
import AWS from 'aws-sdk'

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

  async getToDos(userId) {
    console.log('Getting all groups')
    console.log(userId)
    const result = await this.dynamoDbClient.query({
      TableName: this.todoTable,
      IndexName: this.userIdIndex,
      KeyConditionExpression: 'userId = :userId', // provide specific value  for partition key
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    console.log(result)
    return result
  }

  async createTodos(newTodo, userId) {
    const todoId = uuid.v4()
    const timestamp = new Date().toISOString()
    const newItem = {
      userId: userId,
      todoId: todoId,
      createdAt: timestamp,
      done: false,
      ...newTodo
    }
    const result = await this.dynamoDbClient.put({
      TableName: this.todoTable,
      Item: newItem
    })
    console.log('Create Todo: ', result)
    return newTodo
  }
  async updateTodos(updatedTodo, todoId, userId) {
    const result = await this.dynamoDbClient.update({
        TableName: this.todoTable,
        Key: {userId, todoId}, 
        UpdateExpression: 'set #N=:name, #d=:dueDate, #c=:done',
        ExpressionAttributeNames: { '#N': 'name', '#d':'dueDate', '#c':'done'},
        ExpressionAttributeValues:{
            ":name": updatedTodo.name,
            ":dueDate": updatedTodo.dueDate,
            ":done": updatedTodo.done
        },
        ReturnValues: "UPDATED_NEW"
    })
    console.log('Update Todo: ', result)

    return updatedTodo
  }
  async deleteTodo(todoId, userId){
    const result = await this.dynamoDbClient.delete({
        TableName: this.todoTable,
        Key: {todoId, userId},
        ReturnValues: "ALL_OLD"
    })
    console.log('Update Todo: ', result)
    return result
  }
  async generateUploadUrl(todoId, userId) {
    const uploadUrl = this.s3.getSignedUrl("putObject", {
        Bucket: this.bucketName,
        Key: todoId,
        Expires: parseInt(this.urlExpiration)
    });
    await this.dynamoDbClient.update({
        TableName: this.todoTable, 
        Key: {userId, todoId},
        UpdateExpression: "set attachmentUrl=:URL",
        ExpressionAttributeValues:{
            ":URL": uploadUrl.split("?")[0]
        }
    })
    return uploadUrl
  } 
}
