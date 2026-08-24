import { Link } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear()
  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="brand">量潮众包</Link>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <span>&copy; {year} 量潮科技</span>
      </footer>
    </div>
  )
}
