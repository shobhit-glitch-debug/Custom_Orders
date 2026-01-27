import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineString } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

/** Comma-separated emails to notify on new order. Set in functions/.env as NOTIFY_EMAILS=a@x.com,b@x.com */
const notifyEmails = defineString('NOTIFY_EMAILS', { default: '' });

function buildOrderEmailHtml(order) {
  const { product, customization, billing } = order;
  const cust = customization
    ? `Name on back: ${customization.name || '-'}, Number: ${customization.number || '-'}, Text color: ${customization.textColor || '-'}`
    : 'No customization';

  return `
    <h2>New Custom Order</h2>
    <p><strong>Product:</strong> ${product?.name || '-'} ($${Number(product?.price || 0).toFixed(2)})</p>
    <p><strong>Customization:</strong> ${cust}</p>
    <hr />
    <h3>Billing</h3>
    <p><strong>Name:</strong> ${billing?.customerName || '-'}</p>
    <p><strong>Email:</strong> ${billing?.email || '-'}</p>
    <p><strong>Phone:</strong> ${billing?.phone || '-'}</p>
    <p><strong>Address:</strong> ${[billing?.address, billing?.city, billing?.state, billing?.zip].filter(Boolean).join(', ') || '-'}</p>
  `;
}

export const onOrderCreated = onDocumentCreated('orders/{orderId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.warn('onOrderCreated: no snapshot');
    return;
  }

  const order = snapshot.data();
  const orderId = event.params.orderId;
  const recipients = (notifyEmails.value() || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    console.warn('onOrderCreated: NOTIFY_EMAILS not set, skipping email');
    return;
  }

  const html = buildOrderEmailHtml(order);
  const subject = `[Custom Orders] New order #${orderId}`;

  await db.collection('mail').add({
    to: recipients,
    message: {
      subject,
      html,
    },
  });

  console.log(`Order ${orderId}: notification sent to ${recipients.length} recipient(s).`);
});
