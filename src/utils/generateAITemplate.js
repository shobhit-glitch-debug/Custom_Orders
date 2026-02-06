/**
 * Generates an Adobe Illustrator-compatible SVG template
 * Dimensions: 511px × 438px
 * Layout: Number on top, name below
 * @param {Object} options - Template options
 * @param {string} options.name - Player name
 * @param {string} options.number - Player number
 * @param {string} options.textColor - Text color (hex)
 * @returns {Promise<Blob>} - SVG file as Blob
 */
export async function generateAITemplate({ name, number, textColor = '#ffffff' }) {
  // Load and encode font as base64
  let fontBase64 = ''
  try {
    const fontResponse = await fetch('/fonts/KidsTee.ttf')
    const fontBlob = await fontResponse.blob()
    fontBase64 = await blobToBase64(fontBlob)
  } catch (error) {
    console.warn('Failed to load font for embedding:', error)
  }

  // Template dimensions
  const width = 511
  const height = 438
  const centerX = width / 2

  // Layout specifications
  const nameAreaHeight = 107
  const spaceHeight = 50
  const numberAreaHeight = 354

  // Text positioning (centered within each area)
  const nameY = nameAreaHeight / 2  // Center of name area
  const numberY = nameAreaHeight + spaceHeight + (numberAreaHeight / 2)  // Center of number area

  // Font sizes (adjusted to fit within areas)
  const nameFontSize = 80  // Fits within 107px height
  const numberFontSize = 280  // Fits within 354px height

  // Generate SVG content
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
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
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="transparent"/>
  
  <!-- Area Guides (optional, can be removed in AI) -->
  <g id="area-guides" opacity="0.2">
    <!-- Name Area: 107×438px -->
    <rect x="0" y="0" width="${width}" height="${nameAreaHeight}" 
          fill="none" stroke="#00ff00" stroke-width="1" stroke-dasharray="5,5"/>
    <text x="10" y="15" font-size="12" fill="#00ff00">Name Area: ${nameAreaHeight}×${width}px</text>
    
    <!-- Space: 50×438px -->
    <rect x="0" y="${nameAreaHeight}" width="${width}" height="${spaceHeight}" 
          fill="none" stroke="#ffff00" stroke-width="1" stroke-dasharray="5,5"/>
    <text x="10" y="${nameAreaHeight + 15}" font-size="12" fill="#ffff00">Space: ${spaceHeight}×${width}px</text>
    
    <!-- Number Area: 354×438px -->
    <rect x="0" y="${nameAreaHeight + spaceHeight}" width="${width}" height="${numberAreaHeight}" 
          fill="none" stroke="#ff0000" stroke-width="1" stroke-dasharray="5,5"/>
    <text x="10" y="${nameAreaHeight + spaceHeight + 15}" font-size="12" fill="#ff0000">Number Area: ${numberAreaHeight}×${width}px</text>
  </g>
  
  ${name ? `<!-- Name Text -->
  <text 
    x="${centerX}" 
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
  
  ${number ? `<!-- Number Text -->
  <text 
    x="${centerX}" 
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
</svg>`

  // Create blob
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
  return blob
}

/**
 * Downloads the generated template
 * @param {Blob} blob - SVG blob
 * @param {string} filename - Download filename
 */
export function downloadTemplate(blob, filename = 'jersey-template.svg') {
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
