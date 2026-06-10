import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import NewJournal from './pages/NewJournal'
import TradeDetails from './pages/TradeDetails'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        {user && <Navbar user={user} />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal/new"
            element={
              <ProtectedRoute user={user}>
                <NewJournal user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal/:tradeId"
            element={
              <ProtectedRoute user={user}>
                <TradeDetails user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </Router>
  )
}

export default App
