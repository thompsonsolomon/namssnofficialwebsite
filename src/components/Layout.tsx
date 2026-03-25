import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    // { label: 'Blog', path: '/blog' },
    { label: 'Events', path: '/events' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Books', path: '/books' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-primary">
              NamssnFuoye
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-foreground hover:text-primary transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side - Auth & Admin */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <LayoutDashboard size={16} />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                 
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-border">
              <div className="flex flex-col gap-2 mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2 text-primary font-medium text-sm hover:bg-muted rounded-lg transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm font-medium text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm font-medium"
                    >
                      Login
                    </Link>
                   
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted py-8 mt-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">NamssnFuoye</h3>
              <p className="text-muted-foreground text-sm">
                Explore our mission, team, events, and resources.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/books" className="text-muted-foreground hover:text-primary transition-colors">
                    Books & Materials
                  </Link>
                </li>
                <li>
                  <Link to="/announcements" className="text-muted-foreground hover:text-primary transition-colors">
                    Announcements
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <p className="text-muted-foreground text-sm">
                email@department.edu
                <br />
                +1 (555) 123-4567
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 NamssnFuoye Website. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
