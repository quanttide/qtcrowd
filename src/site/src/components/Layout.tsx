import { Link } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="brand">量潮众包</Link>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <span>&copy; 2026 量潮科技</span>
      </footer>
    </div>
  )
}
