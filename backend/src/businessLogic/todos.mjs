import { TodosAccess } from '../dataLayer/todosAccess.mjs'
import { AttachmentUtils } from '../fileStorage/attachmentUtils.mjs'
import * as uuid from 'uuid'

const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodos(userId) {
  return todoAccess.getToDos(userId)
}
export async function createTodo(newTodo, userId) {
  return todoAccess.createTodos(newTodo, userId)
}

export async function updateTodo(itemToUpdate, todoId, userId){
  return todoAccess.updateTodos(itemToUpdate, todoId, userId);
}

export async function deleteTodo(todoId, userId){
  return todoAccess.deleteTodo(todoId, userId)
} 

export async function getUploadUrl(todoId, userId){
  return attachmentUtils.generateUploadUrl(todoId, userId)
}