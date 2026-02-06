import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'

export default function Admin() {
  const [form, setForm] = useState({
    name: '',
    price: '',
    type: 'jersey',
    description: '',
  })
  const [frontImage, setFrontImage] = useState(null)
  const [frontImagePreview, setFrontImagePreview] = useState(null)
  const [backImage, setBackImage] = useState(null)
  const [backImagePreview, setBackImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleImageChange = (type) => (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'front') {
          setFrontImage(file)
          setFrontImagePreview(reader.result)
        } else {
          setBackImage(file)
          setBackImagePreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!db || !storage) {
      setError('Firebase not initialized. Check your .env file.')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      let frontImageUrl = null
      let backImageUrl = null

      // Upload front image if provided
      if (frontImage) {
        const frontImageRef = ref(storage, `products/${Date.now()}_front_${frontImage.name}`)
        await uploadBytes(frontImageRef, frontImage)
        frontImageUrl = await getDownloadURL(frontImageRef)
      }

      // Upload back image if provided
      if (backImage) {
        const backImageRef = ref(storage, `products/${Date.now()}_back_${backImage.name}`)
        await uploadBytes(backImageRef, backImage)
        backImageUrl = await getDownloadURL(backImageRef)
      }

      // Add product to Firestore
      await addDoc(collection(db, 'products'), {
        name: form.name,
        price: Number(form.price),
        type: form.type,
        description: form.description || '',
        frontImageUrl: frontImageUrl,
        backImageUrl: backImageUrl,
        imageUrl: frontImageUrl || backImageUrl, // For backward compatibility
        createdAt: new Date(),
      })

      setSuccess(true)
      setForm({ name: '', price: '', type: 'jersey', description: '' })
      setFrontImage(null)
      setFrontImagePreview(null)
      setBackImage(null)
      setBackImagePreview(null)
      if (e.target.frontImage) e.target.frontImage.value = ''
      if (e.target.backImage) e.target.backImage.value = ''
    } catch (err) {
      setError(err.message || 'Failed to add product')
    } finally {
      setUploading(false)
    }
  }

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  // Store management state - Fixed stores with editable emails
  const [mackyEmail, setMackyEmail] = useState('')
  const [jjmEmail, setJjmEmail] = useState('')
  const [loadingStores, setLoadingStores] = useState(true)
  const [savingStores, setSavingStores] = useState(false)
  const [storeSuccess, setStoreSuccess] = useState(false)
  const [storeError, setStoreError] = useState(null)

  // Fetch store emails on component mount
  useEffect(() => {
    if (!db) {
      setLoadingStores(false)
      return
    }

    async function fetchStores() {
      try {
        const querySnapshot = await getDocs(collection(db, 'stores'))
        querySnapshot.docs.forEach((doc) => {
          const data = doc.data()
          if (data.name === 'Macky Store') {
            setMackyEmail(data.email || '')
          } else if (data.name === 'JJM Printing') {
            setJjmEmail(data.email || '')
          }
        })
      } catch (err) {
        console.error('Failed to fetch stores:', err)
        setStoreError('Failed to load store emails')
      } finally {
        setLoadingStores(false)
      }
    }

    fetchStores()
  }, [])

  // Handle store email updates
  const handleSaveStores = async (e) => {
    e.preventDefault()
    if (!db) {
      setStoreError('Firebase not initialized. Check your .env file.')
      return
    }

    setSavingStores(true)
    setStoreError(null)
    setStoreSuccess(false)

    try {
      // Get existing stores
      const querySnapshot = await getDocs(collection(db, 'stores'))
      let mackyDocId = null
      let jjmDocId = null

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.name === 'Macky Store') mackyDocId = doc.id
        if (data.name === 'JJM Printing') jjmDocId = doc.id
      })

      // Update or create Macky Store
      if (mackyEmail.trim()) {
        if (mackyDocId) {
          await updateDoc(doc(db, 'stores', mackyDocId), {
            email: mackyEmail,
            updatedAt: new Date(),
          })
        } else {
          await addDoc(collection(db, 'stores'), {
            name: 'Macky Store',
            email: mackyEmail,
            createdAt: new Date(),
          })
        }
      }

      // Update or create JJM Printing
      if (jjmEmail.trim()) {
        if (jjmDocId) {
          await updateDoc(doc(db, 'stores', jjmDocId), {
            email: jjmEmail,
            updatedAt: new Date(),
          })
        } else {
          await addDoc(collection(db, 'stores'), {
            name: 'JJM Printing',
            email: jjmEmail,
            createdAt: new Date(),
          })
        }
      }

      setStoreSuccess(true)
      setTimeout(() => setStoreSuccess(false), 3000)
    } catch (err) {
      setStoreError(err.message || 'Failed to save store emails')
    } finally {
      setSavingStores(false)
    }
  }

  if (!db || !storage) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          <h2>Firebase not configured</h2>
          <p>Please set up your Firebase config in <code>.env</code> file.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Admin — Add Product</h1>
      <p style={styles.subtitle}>Upload products with images to Firebase</p>

      {success && (
        <div style={styles.successBox}>
          ✓ Product added successfully!
        </div>
      )}

      {error && (
        <div style={styles.errorBox}>
          ✗ {error}
        </div>
      )}

      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.label}>Product Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
          style={styles.input}
          placeholder="e.g. Jersey T-Shirt"
        />

        <label style={styles.label}>Price *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => update('price', e.target.value)}
          required
          style={styles.input}
          placeholder="24.99"
        />

        <label style={styles.label}>Product Type *</label>
        <select
          value={form.type}
          onChange={(e) => update('type', e.target.value)}
          required
          style={styles.input}
        >
          <option value="jersey">Jersey (with name/number customization)</option>
          <option value="polo">Polo</option>
          <option value="shirt">Shirt</option>
          <option value="hoodie">Hoodie</option>
          <option value="other">Other</option>
        </select>

        <label style={styles.label}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          style={{ ...styles.input, ...styles.textarea }}
          placeholder="Optional product description"
          rows="3"
        />

        <label style={styles.label}>Front View Image</label>
        <div style={styles.imageSection}>
          <input
            type="file"
            name="frontImage"
            accept="image/*"
            onChange={handleImageChange('front')}
            style={styles.fileInput}
          />
          {frontImagePreview && (
            <div style={styles.preview}>
              <img src={frontImagePreview} alt="Front Preview" style={styles.previewImg} />
              <button
                type="button"
                onClick={() => {
                  setFrontImage(null)
                  setFrontImagePreview(null)
                }}
                style={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <label style={styles.label}>Back View Image</label>
        <div style={styles.imageSection}>
          <input
            type="file"
            name="backImage"
            accept="image/*"
            onChange={handleImageChange('back')}
            style={styles.fileInput}
          />
          {backImagePreview && (
            <div style={styles.preview}>
              <img src={backImagePreview} alt="Back Preview" style={styles.previewImg} />
              <button
                type="button"
                onClick={() => {
                  setBackImage(null)
                  setBackImagePreview(null)
                }}
                style={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          style={{
            ...styles.submit,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Add Product'}
        </button>
      </form>

      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>How it works:</h3>
        <ol style={styles.infoList}>
          <li>Fill in product details (name, price, type)</li>
          <li>Upload front view image (optional, max 5MB)</li>
          <li>Upload back view image (optional, max 5MB)</li>
          <li>Click "Add Product" — images upload to Firebase Storage</li>
          <li>Product data saves to Firestore <code>products</code> collection</li>
          <li>Product appears on the main listing page</li>
        </ol>
      </div>

      {/* Store Management Section */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={styles.sectionTitle}>Store Email Management</h2>
        <p style={styles.subtitle}>Update email addresses for Macky Store and JJM Printing</p>

        {storeSuccess && (
          <div style={styles.successBox}>
            ✓ Store emails saved successfully!
          </div>
        )}

        {storeError && (
          <div style={styles.errorBox}>
            ✗ {storeError}
          </div>
        )}

        {loadingStores ? (
          <div style={styles.form}>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              Loading store information...
            </p>
          </div>
        ) : (
          <form style={styles.form} onSubmit={handleSaveStores}>
            <div style={styles.storeField}>
              <label style={styles.label}>Macky Store Email</label>
              <input
                type="email"
                value={mackyEmail}
                onChange={(e) => setMackyEmail(e.target.value)}
                style={styles.input}
                placeholder="Enter Macky Store email"
              />
            </div>

            <div style={styles.storeField}>
              <label style={styles.label}>JJM Printing Email</label>
              <input
                type="email"
                value={jjmEmail}
                onChange={(e) => setJjmEmail(e.target.value)}
                style={styles.input}
                placeholder="Enter JJM Printing email"
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.submit,
                cursor: savingStores ? 'not-allowed' : 'pointer',
                opacity: savingStores ? 0.6 : 1,
              }}
              disabled={savingStores}
            >
              {savingStores ? 'Saving...' : 'Save Store Emails'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { paddingBottom: '2rem', maxWidth: 700, margin: '0 auto' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: 700,
    margin: '0 0 0.25rem',
  },
  subtitle: { color: 'var(--text-muted)', margin: '0 0 1.5rem' },
  form: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 500 },
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
  textarea: { resize: 'vertical', fontFamily: 'inherit' },
  fileInput: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    background: 'var(--bg-elevated)',
    border: '1px dashed var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    cursor: 'pointer',
  },
  imageSection: { marginBottom: '1rem' },
  preview: {
    marginTop: '0.5rem',
    position: 'relative',
    display: 'inline-block',
  },
  previewImg: {
    maxWidth: 200,
    maxHeight: 200,
    borderRadius: 8,
    border: '1px solid var(--border)',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: '0.25rem 0.5rem',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  submit: {
    width: '100%',
    padding: '0.9rem 1.25rem',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: '1rem',
    fontWeight: 600,
  },
  successBox: {
    background: 'var(--success)',
    color: 'white',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    marginBottom: '1rem',
    fontSize: '0.95rem',
  },
  errorBox: {
    background: '#ef4444',
    color: 'white',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    marginBottom: '1rem',
    fontSize: '0.95rem',
  },
  infoBox: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.25rem',
  },
  infoTitle: { margin: '0 0 0.75rem', fontSize: '1rem' },
  infoList: {
    margin: 0,
    paddingLeft: '1.5rem',
    color: 'var(--text-muted)',
    lineHeight: 1.8,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: '0 0 0.5rem',
  },
  tableContainer: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.5rem',
    marginTop: '1.5rem',
    overflowX: 'auto',
  },
  tableTitle: {
    margin: '0 0 1rem',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem',
    borderBottom: '2px solid var(--border)',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: 'var(--text)',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '0.75rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  storeField: {
    marginBottom: '1rem',
  },
}
