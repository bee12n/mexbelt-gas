import { useAuth } from '../lib/auth'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'
import Link from 'next/link'

interface LayoutProps { children: ReactNode; title?: string; subtitle?: string }

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading || !user) return null

  const isSuperUser = user.rol === 'superusuario'
  const path = router.pathname

  const navItems = [
    { href: '/', label: 'Calculadora', icon: '⛽' },
    { href: '/historial', label: 'Mi historial', icon: '📋' },
    ...(isSuperUser ? [
      { href: '/admin', label: 'Todos los viajes', icon: '📊' },
      { href: '/usuarios', label: 'Usuarios', icon: '👥' },
    ] : []),
  ]

  const initials = user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⛽</div>
          <span>Gasolina</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`nav-item ${path === item.href ? 'active' : ''}`}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name">{user.nombre}</div>
            <div className="role">{isSuperUser ? '⭐ Admin' : 'Usuario'}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Cerrar sesión">↩</button>
        </div>
      </aside>

      <main className="main-content">
        {(title || subtitle) && (
          <div className="page-header">
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
