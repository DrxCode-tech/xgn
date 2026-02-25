import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { Menu, X, LogOut, Home } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="glass border-b border-indigo-500/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="gradient-text font-bold text-xl hidden sm:inline">XGN</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/dashboard" className="text-slate-300 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-2">
              <Home size={18} />
              Dashboard
            </Link>
            <Link to="/property/new" className="btn-primary text-sm">
              New Property
            </Link>
            <button
              onClick={handleLogout}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden btn-icon"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 space-y-2"
          >
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-slate-300 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-300"
            >
              Dashboard
            </Link>
            <Link
              to="/property/new"
              className="block px-4 py-2 btn-primary text-center"
            >
              New Property
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 btn-secondary text-left flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
