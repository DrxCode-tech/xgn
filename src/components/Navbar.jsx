import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { Menu, X, LogOut, CandlestickChart, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('profileUser')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="glass border-b border-indigo-500/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
              <CandlestickChart size={22} />
            </span>
            <span>
              <span className="block text-sm font-bold leading-4">XGN Journal</span>
              <span className="block text-xs text-slate-400">{user?.email}</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/journal/new" className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} />
              Record Trade
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
              to="/journal/new"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 btn-primary text-center"
            >
              Record Trade
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
