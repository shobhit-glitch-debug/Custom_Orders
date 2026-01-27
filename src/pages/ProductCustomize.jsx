import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import JerseyPreview from '../components/JerseyPreview'

const MOCK_PRODUCT = { id: 'jersey-1', name: 'Jersey T-Shirt', price: 24.99, type: 'jersey' }
const TEXT_COLORS = ['#ffffff', '#000000', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#f97316']

export default function ProductCustomize() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
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

  const handleProceed = () => {
    navigate('/review', {
      state: {
        product,
        customization: isJersey ? { name, number, textColor } : null,
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
                  {number && <div style={{ ...styles.numberText, color: textColor }}>{number}</div>}
                  {name && <div style={{ ...styles.nameText, color: textColor }}>{name.toUpperCase()}</div>}
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
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="e.g. SMITH"
                style={styles.input}
                maxLength={20}
              />
              <label style={styles.label}>Number on back</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="e.g. 10"
                style={styles.input}
                maxLength={3}
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

          <button style={styles.proceed} onClick={handleProceed}>
            Proceed to billing
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
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    alignItems: 'start',
  },
  previewSection: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.5rem',
    position: 'sticky',
    top: '1rem',
  },
  previewLabel: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' },
  backImageContainer: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  backImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 8,
  },
  overlayText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  numberText: {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    marginBottom: '0.25rem',
  },
  nameText: {
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: 'var(--font-display)',
  },
  formSection: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.5rem',
  },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem' },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: '1rem',
  },
  colorGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' },
  colorBtn: { width: 36, height: 36, borderRadius: '50%', padding: 0 },
  noCustom: { color: 'var(--text-muted)', marginBottom: '1.5rem' },
  proceed: {
    width: '100%',
    padding: '0.9rem 1.25rem',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: '1rem',
    fontWeight: 600,
  },
  skeleton: { color: 'var(--text-muted)', padding: '2rem' },
}
