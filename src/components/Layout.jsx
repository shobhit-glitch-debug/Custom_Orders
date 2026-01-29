import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <Link to="/" style={styles.logoContainer}>
          <img src="/assets/mackly-logo.png" alt="Mackly" style={styles.logoImage} />
          <span style={styles.logoText}>Custom Orders</span>
        </Link>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink} className="nav-link">Products</Link>
          <Link to="/admin" style={styles.navLink} className="nav-link">Admin</Link>
        </nav>
      </header>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    background: 'white',
    borderBottom: '1px solid var(--border)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
  },
  logoImage: {
    height: '40px',
    width: 'auto',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'black',
  },
  nav: {
    display: 'flex',
    gap: '1.5rem',
  },
  navLink: {
    color: 'black',
    fontSize: '0.95rem',
  },
  main: {
    flex: 1,
    padding: '1.5rem',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
}
