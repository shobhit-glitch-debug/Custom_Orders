import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import JerseyPreview from '../components/JerseyPreview'

export default function ReviewBilling() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [savedToDb, setSavedToDb] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  const product = state?.product
  const customization = state?.customization
  const orderId = state?.orderId
  const capturedBackUrl = state?.capturedBackUrl
  const capturedFrontUrl = state?.capturedFrontUrl

  useEffect(() => {
    if (!product) navigate('/', { replace: true })
  }, [product, navigate])

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!product) return
    setSubmitting(true)

    // Save order to Firestore with already-captured image URLs
    try {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
      if (apiKey && apiKey !== 'your-api-key' && db) {
        await addDoc(collection(db, 'orders'), {
          product: { id: product.id, name: product.name, price: product.price, type: product.type },
          customization: customization || null,
          billing: { ...form },
          orderId: orderId || null,
          images: {
            backUrl: capturedBackUrl || null,
            frontUrl: capturedFrontUrl || null,
          },
          createdAt: serverTimestamp(),
        })
        setSavedToDb(true)
      }
      setDone(true)
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  if (!product) return null

  const price = Number(product.price || 0)
  const tax = price * 0.08
  const total = price + tax

  if (done) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <h2 style={styles.successTitle}>Order received</h2>
          <p style={styles.successText}>
            {savedToDb
              ? "Thank you! Your custom order has been saved. We'll send a confirmation to your email."
              : "Thank you! Your order has been received. Add Firebase config in .env to save orders and trigger email notifications."}
          </p>
          <button style={styles.backBtn} onClick={() => navigate('/')}>
            Back to products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Review & Billing</h1>
      <p style={styles.subtitle}>Confirm your order and complete payment details</p>

      <div className="review-layout" style={styles.layout}>
        <div style={styles.singleColumn}>
          {/* Your Order Card */}
          <div style={styles.previewCard}>
            <h3 style={styles.cardTitle}>Your order</h3>

            <div style={styles.imagesGrid}>
              {/* Back view with customization */}
              <div style={styles.imageSection}>
                <div style={styles.imageLabel}>Back view</div>
                {capturedBackUrl ? (
                  <div style={styles.imageContainer}>
                    <img src={capturedBackUrl} alt="Back view (captured)" style={styles.productImage} />
                  </div>
                ) : product.backImageUrl ? (
                  <div style={styles.imageContainer}>
                    <img src={product.backImageUrl} alt="Back view" style={styles.productImage} />
                    {product.type === 'jersey' && (customization?.name || customization?.number) && (
                      <div style={styles.overlayText}>
                        {customization.name && <div style={{ ...styles.nameText, color: customization.textColor }}>{customization.name.toUpperCase()}</div>}
                        {customization.number && <div style={{ ...styles.numberText, color: customization.textColor }}>{customization.number}</div>}
                      </div>
                    )}
                  </div>
                ) : (
                  <JerseyPreview
                    name={customization?.name}
                    number={customization?.number}
                    textColor={customization?.textColor}
                    isJersey={product.type === 'jersey'}
                    compact
                  />
                )}
              </div>

              {/* Front view */}
              {(capturedFrontUrl || product.frontImageUrl) && (
                <div style={styles.imageSection}>
                  <div style={styles.imageLabel}>Front view</div>
                  <div style={styles.imageContainer}>
                    <img
                      src={capturedFrontUrl || product.frontImageUrl}
                      alt="Front view"
                      style={styles.productImage}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={styles.meta}>
              <span>{product.name}</span>
              {customization && (
                <span style={styles.metaDetail}>
                  {customization.name || 'NAME'} · {customization.number || '0'}
                </span>
              )}
            </div>
          </div>

          {/* Totals Section */}
          <div style={styles.totals}>
            <div style={styles.row}>
              <span>Subtotal</span>
              <span>${price.toFixed(2)}</span>
            </div>
            <div style={styles.row}>
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.row, ...styles.totalRow }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Billing Details Form */}
          <form style={styles.form} onSubmit={handleSubmit}>
            <h3 style={styles.formTitle}>Billing details</h3>
            <label style={styles.label}>Full name *</label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => update('customerName', e.target.value)}
              required
              style={styles.input}
              placeholder="John Doe"
            />
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
              style={styles.input}
              placeholder="john@example.com"
            />
            <label style={styles.label}>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              style={styles.input}
              placeholder="+1 234 567 8900"
            />
            <label style={styles.label}>Address *</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              required
              style={styles.input}
              placeholder="123 Main St"
            />
            <div className="row-inputs" style={styles.rowInputs}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  required
                  style={styles.input}
                  placeholder="City"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  style={styles.input}
                  placeholder="State"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>ZIP *</label>
                <input
                  type="text"
                  value={form.zip}
                  onChange={(e) => update('zip', e.target.value)}
                  required
                  style={styles.input}
                  placeholder="ZIP"
                />
              </div>
            </div>
            <button type="submit" style={styles.submit} disabled={submitting}>
              {submitting ? 'Processing…' : 'Complete order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { paddingBottom: '2rem' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: 700,
    margin: '0 0 0.25rem',
  },
  subtitle: { color: 'var(--text-muted)', margin: '0 0 1.5rem' },
  layout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  singleColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  left: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  previewCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.25rem',
  },
  cardTitle: { margin: '0 0 1rem', fontSize: '1rem' },
  imagesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  imageSection: { marginBottom: '0' },
  imageLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
    fontWeight: 500,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  productImage: {
    maxWidth: '100%',
    width: '100%',
    height: '300px',
    objectFit: 'contain',
    borderRadius: 8,
  },
  overlayText: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  numberText: {
    fontSize: 'clamp(3rem, 8vw, 5rem)',
    fontWeight: 900,
    fontFamily: 'var(--font-display)',
    lineHeight: 1,
    textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)',
    letterSpacing: '0.1em',
  },
  nameText: {
    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    lineHeight: 1,
    textShadow: '1px 1px 3px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)',
    letterSpacing: '0.15em',
  },
  meta: { display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.75rem' },
  metaDetail: { color: 'var(--text-muted)', fontSize: '0.9rem' },
  totals: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1rem 1.25rem',
  },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' },
  totalRow: { marginTop: '0.5rem', marginBottom: 0, paddingTop: '0.5rem', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.1rem' },
  form: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.5rem',
    width: '100%',
  },
  formTitle: { margin: '0 0 1rem', fontSize: '1rem' },
  label: { display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' },
  input: {
    width: '100%',
    padding: '0.65rem 1rem',
    marginBottom: '1rem',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: '1rem',
  },
  rowInputs: { display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '1rem', marginBottom: '1rem' },
  inputGroup: {},
  submit: {
    width: '100%',
    marginTop: '0.5rem',
    padding: '0.9rem 1.25rem',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: '1rem',
    fontWeight: 600,
  },
  successCard: {
    maxWidth: 420,
    margin: '2rem auto',
    padding: '2rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    textAlign: 'center',
  },
  successTitle: { margin: '0 0 0.5rem', color: 'var(--success)' },
  successText: { color: 'var(--text-muted)', margin: '0 0 1.5rem' },
  backBtn: {
    padding: '0.65rem 1.25rem',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: '1rem',
  },
}
