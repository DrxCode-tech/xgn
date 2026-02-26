import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { Menu, X, LogOut, Home } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const userdata = JSON.parse(localStorage.getItem('profileUser'))
  console.log('Navbar user data:', userdata)

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

          {/* Profile Avatar (Replaces X / XGN Logo) */}
          <Link
            to={`/profile/${user?.uid}`}
            className="flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-indigo-500/40 group-hover:border-indigo-400 transition-all duration-300 shadow-lg">
              <img
                src={
                  userdata?.profilePhoto ||
                  'https://via.placeholder.com/200'
                }
                alt="Profile"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Optional name next to avatar (desktop only) */}
            <span className="hidden sm:inline text-slate-300 font-semibold group-hover:text-indigo-400 transition-colors duration-300">
              {userdata?.fullName || 'Profile'}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/dashboard"
              className="text-slate-300 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-2"
            >
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

            <Link
              to={`/profile/${userdata?.uid}`}
              className="block px-4 py-2 text-slate-300 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-300"
            >
              View Profile
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