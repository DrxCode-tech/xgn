import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Plus, Home, Zap, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

export default function Dashboard() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalPosts: 0,
    thisMonth: 0,
  })

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const docRef = doc(db, 'properties', auth.currentUser.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          const props = data.properties || []

          // Sort manually (since no query ordering anymore)
          props.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt)
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt)
            return dateB - dateA
          })

          setProperties(props)

          setStats({
            totalProperties: props.length,
            totalPosts: props.reduce(
              (sum, prop) => sum + (prop.postsGenerated || 0),
              0
            ),
            thisMonth: props.filter((prop) => {
              const created =
                prop.createdAt?.toDate?.() || new Date(prop.createdAt)
              return created > new Date(new Date().setDate(1))
            }).length,
          })
        } else {
          setProperties([])
        }
      } catch (error) {
        toast.error('Error loading properties')
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="gradient-text text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-slate-400">Manage your properties and generate posts</p>
            </div>
            <Link to="/property/new" className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              New Property
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Home,
                label: 'Total Properties',
                value: stats.totalProperties,
                color: 'from-indigo-600 to-indigo-400',
              },
              {
                icon: Zap,
                label: 'Posts Generated',
                value: stats.totalPosts,
                color: 'from-pink-600 to-pink-400',
              },
              {
                icon: TrendingUp,
                label: 'This Month',
                value: stats.thisMonth,
                color: 'from-emerald-600 to-emerald-400',
              },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <motion.div key={idx} variants={item} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-slate-100">{stat.value}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Properties List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Your Properties</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-skeleton h-64"></div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="card text-center py-12">
              <Home size={48} className="mx-auto text-indigo-400 mb-4 opacity-50" />
              <p className="text-slate-400 mb-4">No properties yet</p>
              <Link to="/property/new" className="btn-primary inline-flex items-center gap-2">
                <Plus size={20} />
                Create Your First Property
              </Link>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {properties.map((property) => (
                <motion.div key={property.id} variants={item} className="card-hover group">
                  {/* Property Image */}
                  {property.images && property.images.length > 0 && (
                    <div className="mb-4 rounded-lg overflow-hidden h-40 bg-slate-800">
                      <img
                        src={property.images[0].url}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Property Info */}
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{property.name}</h3>
                  <p className="text-slate-400 text-sm mb-3">{property.location}</p>

                  {/* Property Details */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="bg-indigo-500/10 rounded p-2 text-center">
                      <p className="text-slate-400 text-xs">Beds</p>
                      <p className="text-indigo-300 font-bold">{property.bedrooms}</p>
                    </div>
                    <div className="bg-indigo-500/10 rounded p-2 text-center">
                      <p className="text-slate-400 text-xs">Baths</p>
                      <p className="text-indigo-300 font-bold">{property.bathrooms}</p>
                    </div>
                    <div className="bg-indigo-500/10 rounded p-2 text-center">
                      <p className="text-slate-400 text-xs">Posts</p>
                      <p className="text-indigo-300 font-bold">{property.postsGenerated || 0}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <p className="text-2xl font-bold text-indigo-400 mb-4">
                    ₦{property.price?.toLocaleString()}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/posts/${property.id}`}
                      className="flex-1 btn-primary text-sm text-center"
                    >
                      View Posts
                    </Link>
                    <Link
                      to={`/property/${property.id}/edit`}
                      className="flex-1 btn-secondary text-sm text-center"
                    >
                      Edit
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
