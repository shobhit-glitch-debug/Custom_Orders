import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const MOCK_PRODUCTS = [
  { id: 'jersey-1', name: 'Jersey T-Shirt', price: 24.99, type: 'jersey', imageUrl: null },
  { id: 'polo-1', name: 'Polo Shirt', price: 29.99, type: 'polo', imageUrl: null },
  { id: 'jersey-2', name: 'Team Jersey', price: 34.99, type: 'jersey', imageUrl: null },
]

export default function ProductListing() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    async function load() {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
      if (!apiKey || apiKey === 'your-api-key') {
        if (mounted) {
          setProducts(MOCK_PRODUCTS)
          setLoading(false)
        }
        return
      }

      try {
        if (!db) {
          throw new Error('Firebase not initialized')
        }
        const snap = await getDocs(collection(db, 'products'))
        if (!mounted) return
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setProducts(list.length ? list : MOCK_PRODUCTS)
      } catch (e) {
        if (mounted) {
          setError(e.message)
          setProducts(MOCK_PRODUCTS)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Custom Apparel</h1>
      <p style={styles.subtitle}>Choose a garment to personalize</p>

      {error && (
        <div style={styles.banner}>
          Firebase not configured — showing mock products. Add your config in <code>.env</code>.
        </div>
      )}

      {loading ? (
        <div style={styles.grid}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.cardSkeleton} />
          ))}
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map((p) => (
            <button
              key={p.id}
              className="product-card"
              style={styles.card}
              onClick={() => navigate(`/customize/${p.id}`)}
            >
              <div style={styles.imgWrap}>
                {(p.frontImageUrl || p.imageUrl) ? (
                  <img src={p.frontImageUrl || p.imageUrl} alt={p.name} style={styles.img} />
                ) : (
                  <JerseyPlaceholder type={p.type} />
                )}
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <span style={styles.price}>${Number(p.price || 0).toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function JerseyPlaceholder({ type }) {
  return (
    <svg viewBox="0 0 120 140" style={styles.placeholderSvg}>
      <path
        d="M60 10 L90 30 L90 70 Q90 100 60 110 Q30 100 30 70 L30 30 Z"
        fill="var(--bg-card)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <circle cx="60" cy="50" r="12" fill="var(--border)" />
      {type === 'jersey' && (
        <rect x="45" y="75" width="30" height="20" rx="2" fill="var(--border)" opacity="0.6" />
      )}
    </svg>
  )
}

const styles = {
  page: { paddingBottom: '2rem' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
    fontWeight: 700,
    margin: '0 0 0.25rem',
  },
  subtitle: { color: 'var(--text-muted)', margin: '0 0 1.5rem' },
  banner: {
    background: 'var(--accent-muted)',
    color: 'var(--text)',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'left',
    padding: 0,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardSkeleton: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    minHeight: 280,
  },
  imgWrap: {
    aspectRatio: '6/7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-elevated)',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholderSvg: { width: '60%', height: 'auto', maxHeight: '100%' },
  cardBody: { padding: '1rem' },
  cardTitle: { margin: '0 0 0.25rem', fontSize: '1.1rem' },
  price: { color: 'var(--accent)', fontWeight: 600 },
}
