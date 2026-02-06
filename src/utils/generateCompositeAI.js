/**
 * Generates a composite Adobe Illustrator file combining template with shirt back image
 * @param {Object} options - Composite options
 * @param {string} options.shirtImageUrl - URL of the shirt back image
 * @param {string} options.name - Player name
 * @param {string} options.number - Player number
 * @param {string} options.textColor - Text color (hex)
 * @returns {Promise<Blob>} - Composite SVG file as Blob
 */
export async function generateCompositeAI({ shirtImageUrl, name, number, textColor = '#ffffff' }) {
  // Load and encode font as base64
  let fontBase64 = ''
  try {
    const fontResponse = await fetch('/fonts/KidsTee.ttf')
    const fontBlob = await fontResponse.blob()
    fontBase64 = await blobToBase64(fontBlob)
  } catch (error) {
    console.warn('Failed to load font for embedding:', error)
  }

  // Load shirt image and convert to base64
  let shirtBase64 = ''
  let shirtWidth = 800
  let shirtHeight = 1000

  try {
    const shirtResponse = await fetch(shirtImageUrl)
    const shirtBlob = await shirtResponse.blob()
    shirtBase64 = await blobToBase64(shirtBlob)

    // Get actual image dimensions
    const dimensions = await getImageDimensions(shirtImageUrl)
    shirtWidth = dimensions.width
    shirtHeight = dimensions.height
  } catch (error) {
    console.error('Failed to load shirt image:', error)
    throw new Error('Failed to load shirt image')
  }

  // Template dimensions
  const templateWidth = 511
  const templateHeight = 438

  // Calculate template position on shirt (centered, positioned at 40% from top)
  const templateX = (shirtWidth - templateWidth) / 2
  const templateY = shirtHeight * 0.40

  // Layout specifications within template
  const nameAreaHeight = 107
  const spaceHeight = 50
  const numberAreaHeight = 354

  // Text positioning within template (centered in each area)
  const textCenterX = templateX + (templateWidth / 2)
  const nameY = templateY + (nameAreaHeight / 2)
  const numberY = templateY + nameAreaHeight + spaceHeight + (numberAreaHeight / 2)

  // Font sizes
  const nameFontSize = 80
  const numberFontSize = 280

  // Generate composite SVG
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${shirtWidth}" height="${shirtHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${fontBase64 ? `<style type="text/css">
      @font-face {
        font-family: 'KidsTee';
        src: url(${fontBase64}) format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    </style>` : ''}
  </defs>
  
  <!-- Shirt Back Image -->
  <image href="${shirtBase64}" width="${shirtWidth}" height="${shirtHeight}" x="0" y="0"/>
  
  <!-- Template Area (for reference, can be removed) -->
  <rect x="${templateX}" y="${templateY}" width="${templateWidth}" height="${templateHeight}" 
        fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="5,5"/>
  
  ${number ? `<!-- Number Text -->
  <text 
    x="${textCenterX}" 
    y="${numberY}" 
    font-family="KidsTee, Arial, sans-serif" 
    font-size="${numberFontSize}" 
    font-weight="900"
    fill="${textColor}"
    text-anchor="middle"
    dominant-baseline="middle"
    letter-spacing="0.1em"
    style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));"
  >${number}</text>` : ''}
  
  ${name ? `<!-- Name Text -->
  <text 
    x="${textCenterX}" 
    y="${nameY}" 
    font-family="KidsTee, Arial, sans-serif" 
    font-size="${nameFontSize}" 
    font-weight="700"
    fill="${textColor}"
    text-anchor="middle"
    dominant-baseline="middle"
    letter-spacing="0.15em"
    style="filter: drop-shadow(1px 1px 3px rgba(0,0,0,0.5));"
  >${name.toUpperCase()}</text>` : ''}
</svg>`

  // Create blob
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
  return blob
}

/**
 * Downloads the generated composite
 * @param {Blob} blob - SVG blob
 * @param {string} filename - Download filename
 */
export function downloadComposite(blob, filename = 'jersey-composite.svg') {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Converts a Blob to base64 data URL
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>} - Base64 data URL
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Gets image dimensions
 * @param {string} imageUrl - Image URL
 * @returns {Promise<{width: number, height: number}>}
 */
function getImageDimensions(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = reject
    img.src = imageUrl
  })
}
