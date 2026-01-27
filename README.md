# Custom Orders — Jersey & Apparel

A web app for custom jersey/apparel orders: **product listing** (Firebase-backed) → **customize** (name/number + text color on back) → **review & billing** → **order saved to Firebase** and **emails sent** to your team.

## Features

- **Product listing** – Fetches garments from Firestore `products` collection; mock data used if Firebase isn’t configured.
- **Customize** – For jersey-type products: name and number on the back, text color picker, live preview.
- **Review & billing** – Order summary, billing form, then submit. Data is stored in Firestore `orders`.
- **Email notifications** – Cloud Function runs when an order is created, writes to the `mail` collection; the **Trigger Email** extension sends emails to your configured recipients.

## Quick start

### 1. Install dependencies

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Run the app (no Firebase)

```bash
npm run dev
```

Open **http://localhost:5173**. The app uses mock products and does not persist orders. You can still run through the full flow.

### 3. Connect Firebase

1. Create a [Firebase project](https://console.firebase.google.com/) and enable **Firestore**.
2. In Project settings → General → Your apps, add a **Web** app and copy the config.
3. In the project root, copy `.env.example` to `.env` and fill in your Firebase config:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=....appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

4. Update `.firebaserc` so `default` is your Firebase **project ID**.
5. Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules

```

### 4. Enable Firebase Storage

1. In Firebase Console → **Storage** → **Get started**
2. Choose a location for your storage bucket
3. Start in **test mode** (we'll deploy rules next)

### 5. Deploy Firestore and Storage rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 6. Add products via Admin page

**Option A: Use the Admin page (recommended)**

1. Start your dev server: `npm run dev`
2. Navigate to **http://localhost:5173/admin**
3. Fill in product details:
   - **Product Name** (e.g. "Jersey T-Shirt")
   - **Price** (e.g. 24.99)
   - **Product Type** (jersey, polo, shirt, hoodie, other)
   - **Description** (optional)
   - **Product Image** (optional, max 5MB)
4. Click **"Add Product"** — image uploads to Firebase Storage, product data saves to Firestore

**Option B: Manual via Firestore Console**

Add documents to the `products` collection. Each document should have:

| Field     | Type   | Description                          |
|----------|--------|--------------------------------------|
| `name`   | string | Product name (e.g. "Jersey T-Shirt") |
| `price`  | number | Price                                |
| `type`   | string | `"jersey"` for name/number customization, else e.g. `"polo"` |
| `imageUrl` | string (optional) | Image URL from Firebase Storage or external URL |
| `description` | string (optional) | Product description |

Example (Firestore Console):

```js
// products/jersey-1
{ name: "Jersey T-Shirt", price: 24.99, type: "jersey", imageUrl: "https://..." }
```

### 7. Trigger Email extension

1. In [Firebase Console](https://console.firebase.google.com/) → **Extensions** → **Install extension**.
2. Choose **Trigger Email from Firestore** (`firestore-send-email`).
3. Configure:
   - **Collection** → `mail` (must match the Cloud Function).
   - **SMTP** – Use an SMTP provider (e.g. [SendGrid](https://sendgrid.com), [Mailgun](https://mailgun.com), or your own SMTP server). Set **Default FROM** and, if needed, **Default REPLY-TO**.

When the Cloud Function adds a document to `mail` with `to` and `message: { subject, html }`, the extension sends the email.

### 8. Deploy Cloud Functions

1. In `functions/`, copy `.env.example` to `.env`.
2. Set **NOTIFY_EMAILS** (comma‑separated addresses to notify on new orders):

```
NOTIFY_EMAILS=admin@example.com,team@example.com
```

3. Deploy:

```bash
firebase deploy --only functions
```

When prompted for **NOTIFY_EMAILS**, enter the same comma‑separated list (or rely on `functions/.env`).

### 9. Build and host (optional)

```bash
npm run build
firebase deploy --only hosting
```

---

## Project structure

```
├── src/
│   ├── components/     # Layout, JerseyPreview
│   ├── pages/          # ProductListing, ProductCustomize, ReviewBilling
│   ├── firebase.js     # Firebase init + Firestore
│   ├── App.jsx
│   └── main.jsx
├── functions/
│   ├── index.js        # onOrderCreated → writes to `mail`
│   ├── .env            # NOTIFY_EMAILS (do not commit)
│   └── package.json
├── firebase.json
├── firestore.rules     # Firestore security rules
├── storage.rules       # Storage security rules
└── .env                # VITE_FIREBASE_* (do not commit)
```

## Data flow

1. **Products** – Read from `products`. Shown on the listing; clicking a product opens `/customize/:productId`.
2. **Customize** – User sets name, number, and text color (jerseys only), then **Proceed to billing**.
3. **Review & billing** – User fills billing form and submits. App writes to `orders` with `product`, `customization`, and `billing`.
4. **Cloud Function** – `onOrderCreated` runs on new `orders` docs, builds an HTML summary, and adds a doc to `mail` with `to: NOTIFY_EMAILS` and `message: { subject, html }`.
5. **Trigger Email** – Sends the email via your SMTP config.

## Firestore collections

- **products** – Read-only by the app. Add/update via Console or Admin.
- **orders** – Create-only by the app. No client read/update/delete.
- **mail** – Write-only by Cloud Functions. Used by the Trigger Email extension.

---

## License

MIT.
