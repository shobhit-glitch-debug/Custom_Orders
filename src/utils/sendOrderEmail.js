/**
 * Send order notification email via Power Automate
 * @param {Object} orderData - Order details
 * @param {string} orderData.orderId - Order ID
 * @param {Object} orderData.product - Product details
 * @param {Object} orderData.customization - Customization details
 * @param {Object} orderData.customer - Customer information
 * @param {Array<string>} storeEmails - Array of store email addresses
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendOrderEmail(orderData, storeEmails) {
  const webhookUrl = import.meta.env.VITE_POWER_AUTOMATE_WEBHOOK_URL

  if (!webhookUrl || webhookUrl === 'your-webhook-url') {
    console.warn('Power Automate webhook URL not configured')
    return { success: false, error: 'Email service not configured' }
  }

  if (!storeEmails || storeEmails.length === 0) {
    console.warn('No store emails provided')
    return { success: false, error: 'No store emails found' }
  }

  // Filter out empty emails
  const validEmails = storeEmails.filter(email => email && email.trim())
  if (validEmails.length === 0) {
    return { success: false, error: 'No valid store emails found' }
  }

  const { orderId, product, customization, customer } = orderData

  // Construct HTML email body
  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    h2 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    h3 { color: #1e40af; margin-top: 20px; }
    .info-row { margin: 8px 0; }
    .label { font-weight: bold; color: #555; }
    .value { color: #000; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🛍️ New Custom Order Received</h2>
    
    <div class="info-row">
      <span class="label">Order ID:</span>
      <span class="value">${orderId}</span>
    </div>
    <div class="info-row">
      <span class="label">Product:</span>
      <span class="value">${product.name}</span>
    </div>
    <div class="info-row">
      <span class="label">Price:</span>
      <span class="value">Rs ${Number(product.price || 0).toFixed(2)}</span>
    </div>

    ${customization ? `
    <h3>👕 Customization Details</h3>
    ${customization.name ? `
    <div class="info-row">
      <span class="label">Name:</span>
      <span class="value">${customization.name}</span>
    </div>` : ''}
    ${customization.number ? `
    <div class="info-row">
      <span class="label">Number:</span>
      <span class="value">${customization.number}</span>
    </div>` : ''}
    ${customization.textColor ? `
    <div class="info-row">
      <span class="label">Text Color:</span>
      <span class="value">${customization.textColor}</span>
    </div>` : ''}
    ` : ''}

    <h3>👤 Customer Information</h3>
    <div class="info-row">
      <span class="label">Name:</span>
      <span class="value">${customer.name}</span>
    </div>
    <div class="info-row">
      <span class="label">Email:</span>
      <span class="value">${customer.email}</span>
    </div>
    <div class="info-row">
      <span class="label">Phone:</span>
      <span class="value">${customer.phone}</span>
    </div>
    <div class="info-row">
      <span class="label">Address:</span>
      <span class="value">${customer.address}</span>
    </div>

    <div class="footer">
      <p>Please process this order at your earliest convenience.</p>
      <p><em>This is an automated notification from the Custom Orders system.</em></p>
    </div>
  </div>
</body>
</html>
  `.trim()

  // Construct Power Automate request payload
  const payload = {
    recipients: validEmails,
    subject: `New Custom Order - ${orderId}`,
    body: emailBody,
    attachments: []
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send order email:', error)
    return {
      success: false,
      error: error.message || 'Failed to send email notification'
    }
  }
}
