import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import JerseyPreview from '../components/JerseyPreview'
import { uploadImageToStorage, generateOrderId } from '../utils/uploadImage'

const MOCK_PRODUCT = { id: 'jersey-1', name: 'Jersey T-Shirt', price: 24.99, type: 'jersey' }
const TEXT_COLORS = ['#ffffff', '#000000', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#f97316']

export default function ProductCustomize() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')


  useEffect(() => {
    let mounted = true
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
    const useFirebase = apiKey && apiKey !== 'your-api-key'

    async function load() {
      if (useFirebase && db) {
        try {
          const snap = await getDoc(doc(db, 'products', productId))
          if (mounted && snap.exists()) setProduct({ id: snap.id, ...snap.data() })
          else if (mounted) setProduct({ ...MOCK_PRODUCT, id: productId })
        } catch {
          if (mounted) setProduct({ ...MOCK_PRODUCT, id: productId })
        }
      } else {
        if (mounted) setProduct({ ...MOCK_PRODUCT, id: productId })
      }
      if (mounted) setLoading(false)
    }

    load()
    return () => { mounted = false }
  }, [productId])

  const isJersey = product?.type === 'jersey'

  const handleProceed = async () => {
    const orderId = generateOrderId()
    let capturedBackUrl = null
    let capturedFrontUrl = null

    // Composite text onto images before navigating
    try {
      setUploading(true)

      // Composite back view with customization
      if (product.backImageUrl && isJersey && (name || number)) {
        const { compositeTextOnImage } = await import('../utils/compositeImage')
        const backBlob = await compositeTextOnImage(product.backImageUrl, { name, number, textColor })
        capturedBackUrl = await uploadImageToStorage(backBlob, `orders/${orderId}/back.png`)
      }

      // Capture front view if it exists (no customization needed)
      if (product.frontImageUrl) {
        // For front view, just fetch and upload the original image
        const response = await fetch(product.frontImageUrl)
        const frontBlob = await response.blob()
        capturedFrontUrl = await uploadImageToStorage(frontBlob, `orders/${orderId}/front.png`)
      }
    } catch (error) {
      console.warn('Failed to composite/upload images:', error.message)
      // Continue anyway - images are optional
    } finally {
      setUploading(false)
    }

    navigate('/review', {
      state: {
        product,
        customization: isJersey ? { name, number, textColor } : null,
        orderId,
        capturedBackUrl,
        capturedFrontUrl,
      },
    })
  }

  if (loading || !product) {
    return (
      <div style={styles.page}>
        <div style={styles.skeleton}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{product.name}</h1>
      <p style={styles.subtitle}>Customize your order</p>

      <div className="customize-layout" style={styles.layout}>
        <div style={styles.previewSection}>
          <div style={styles.previewLabel}>Preview (back of jersey)</div>
          {product.backImageUrl ? (
            <div style={styles.backImageContainer}>
              <img src={product.backImageUrl} alt="Back view" style={styles.backImage} />
              {isJersey && (name || number) && (
                <div style={styles.overlayText}>
                  {name && <div style={{ ...styles.nameText, color: textColor }}>{name.toUpperCase()}</div>}
                  {number && <div style={{ ...styles.numberText, color: textColor }}>{number}</div>}
                </div>
              )}
            </div>
          ) : (
            <JerseyPreview
              name={name}
              number={number}
              textColor={textColor}
              isJersey={isJersey}
            />
          )}
        </div>

        <div style={styles.formSection}>
          {isJersey ? (
            <>
              <label style={styles.label}>Name on back</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="e.g. SMITH"
                style={styles.input}
                maxLength={6}
              />
              <label style={styles.label}>Number on back</label>
              <input
                type="text"
                value={number}
                onChange={(e) => {
                  const num = e.target.value.replace(/\D/g, '')
                  setNumber(num && parseInt(num) > 99 ? '99' : num)
                }}
                placeholder="e.g. 10"
                style={styles.input}
                maxLength={2}
              />
              <label style={styles.label}>Text color</label>
              <div style={styles.colorGrid}>
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{
                      ...styles.colorBtn,
                      background: c,
                      border: textColor === c ? '3px solid var(--accent)' : '2px solid var(--border)',
                    }}
                    onClick={() => setTextColor(c)}
                    title={c}
                  />
                ))}
              </div>
            </>
          ) : (
            <p style={styles.noCustom}>This item has no customization options.</p>
          )}

          <button style={styles.proceed} onClick={handleProceed} disabled={uploading}>
            {uploading ? 'Capturing images...' : 'Proceed to billing'}
          </button>
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
    alignItems: 'stretch',
  },
  previewSection: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '2.5rem',
    minHeight: '1000px',
  },
  previewLabel: { color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 },
  backImageContainer: {
    position: 'relative',
    width: '800px',
    maxWidth: '100%',
    margin: '0 auto',
  },
  backImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: 8,
  },
  overlayText: {
    position: 'absolute',
    top: '30%',
    left: '51%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  numberText: {
    fontSize: 'clamp(10rem, 10vw, 12rem)',
    fontWeight: 900,
    fontFamily: 'var(--font-display)',
    lineHeight: 1,
    textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)',
    letterSpacing: '0.1em',
  },
  nameText: {
    fontSize: 'clamp(6rem, 3vw, 8rem)',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    lineHeight: 1,
    textShadow: '1px 1px 3px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)',
    letterSpacing: '0.15em',
  },
  formSection: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1rem',
    maxWidth: '500px',
    margin: '0 auto',
  },
  label: { display: 'block', marginBottom: '0.4rem', fontWeight: 500, color: 'var(--text)', fontSize: '0.85rem' },
  input: {
    width: '100%',
    padding: '0.6rem',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '0.9rem',
    marginBottom: '0.8rem',
  },
  colorGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' },
  colorBtn: { width: 36, height: 36, borderRadius: '50%', padding: 0 },
  noCustom: { color: 'var(--text-muted)', marginBottom: '1.5rem' },
  proceed: {
    width: '100%',
    padding: '0.75rem',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.8rem',
  },
  skeleton: { color: 'var(--text-muted)', padding: '2rem' },
}
