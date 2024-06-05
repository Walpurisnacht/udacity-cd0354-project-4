import { TodosAccess } from '../dataLayer/todosAccess.mjs'
import { AttachmentUtils } from '../fileStorage/attachmentUtils.mjs'

const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

// Get list of Todos by userId
export async function getToDosByUserId(userId) {
  return todoAccess.getToDosByUserId(userId)
}

// Create a Todo by userId
export async function createTodoByUserId(newTodo, userId) {
  return todoAccess.createTodoByUserId(newTodo, userId)
}

// Update a Todo by userId
export async function updateTodoByUserId(itemToUpdate, todoId, userId){
  return todoAccess.updateTodoByUserId(itemToUpdate, todoId, userId);
}

// Delete a Todo by userId
export async function deleteTodoByUserId(todoId, userId){
  return todoAccess.deleteTodoByUserId(todoId, userId)
} 

// Generate pre-signed URL for a Todo's attachment by userId
export async function getUploadUrlByUserId(todoId, userId){
  return attachmentUtils.generateUploadUrlByUserId(todoId, userId)
}