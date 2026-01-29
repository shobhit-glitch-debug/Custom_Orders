import html2canvas from 'html2canvas'

/**
 * Captures a DOM element as an image
 * @param {HTMLElement} element - The DOM element to capture
 * @param {Object} options - Optional configuration
 * @returns {Promise<Blob>} - The captured image as a Blob
 */
export async function captureElementAsImage(element, options = {}) {
    if (!element) {
        throw new Error('Element is required for image capture')
    }

    try {
        const canvas = await html2canvas(element, {
            backgroundColor: null,
            scale: 3, // Higher quality
            useCORS: true, // Allow cross-origin images
            logging: false,
            allowTaint: true,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            ...options,
        })

        return new Promise((resolve, reject) => {
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
        })
    } catch (error) {
        console.error('Error capturing element:', error)
        throw error
    }
}
