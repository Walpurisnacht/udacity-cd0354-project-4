import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import AWS from 'aws-sdk'

export class AttachmentUtils {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todoTable = process.env.TODOS_TABLE,
    bucketName = process.env.IMG_S3_BUCKET,
    urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    s3 = new AWS.S3({
      signatureVersion: 'v4'
    })
  ) {
    this.documentClient = documentClient
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
    this.todoTable = todoTable
    this.bucketName = bucketName
    this.urlExpiration = urlExpiration
    this.s3 = s3
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
