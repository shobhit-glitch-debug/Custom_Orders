import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

/**
 * Uploads an image blob to Firebase Storage
 * @param {Blob} blob - The image blob to upload
 * @param {string} path - The storage path (e.g., 'orders/123/back.png')
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export async function uploadImageToStorage(blob, path) {
    if (!storage) {
        throw new Error('Firebase Storage is not initialized. Please configure Firebase in .env')
    }

    if (!blob) {
        throw new Error('Blob is required for upload')
    }

    if (!path) {
        throw new Error('Storage path is required')
    }

    try {
        const storageRef = ref(storage, path)
        const snapshot = await uploadBytes(storageRef, blob)
        const downloadURL = await getDownloadURL(snapshot.ref)
        return downloadURL
    } catch (error) {
        console.error('Error uploading to Firebase Storage:', error)
        throw error
    }
}

/**
 * Generates a unique order ID
 * @returns {string} - A unique ID based on timestamp and random string
 */
export function generateOrderId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
