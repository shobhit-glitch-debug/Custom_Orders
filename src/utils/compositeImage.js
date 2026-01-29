/**
 * Composites text onto an image using Canvas API
 * @param {string} imageUrl - URL of the base image
 * @param {Object} customization - Customization details
 * @returns {Promise<Blob>} - The composited image as a Blob
 */
export async function compositeTextOnImage(imageUrl, customization) {
    const { name, number, textColor } = customization

    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => {
            // Create canvas with same dimensions as image
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')

            // Draw the base image
            ctx.drawImage(img, 0, 0)

            // Set text properties
            ctx.fillStyle = textColor || '#ffffff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            // Add text shadow for better visibility
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
            ctx.shadowBlur = 4
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2

            // Calculate positions (45% from top to account for t-shirt position, center horizontally)
            const centerX = canvas.width / 2
            const topY = canvas.height * 0.45

            // Draw name (if provided) - smaller font
            if (name) {
                ctx.font = `bold ${canvas.width * 0.05}px "Bebas Neue", Impact, sans-serif`
                ctx.fillText(name.toUpperCase(), centerX, topY)
            }

            // Draw number (if provided) - smaller font
            if (number) {
                const numberY = name ? topY + (canvas.width * 0.08) : topY
                ctx.font = `900 ${canvas.width * 0.12}px "Bebas Neue", Impact, sans-serif`
                ctx.fillText(number, centerX, numberY)
            }

            // Convert canvas to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob)
                    } else {
                        reject(new Error('Failed to create blob from canvas'))
                    }
                },
                'image/png',
                0.95
            )
        }

        img.onerror = () => {
            reject(new Error('Failed to load image'))
        }

        img.src = imageUrl
    })
}
