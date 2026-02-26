import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Facebook, Twitter, Instagram, Loader, Copy, RotateCcw, Edit2, Check } from 'lucide-react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

export default function GeneratedPosts() {
  const { propertyId } = useParams()
  const [property, setProperty] = useState(null)
  const [activeTab, setActiveTab] = useState('facebook')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [editingTab, setEditingTab] = useState(null)
  const [editContent, setEditContent] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(db, 'properties', auth.currentUser.uid)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          toast.error('No properties found')
          navigate('/dashboard')
          return
        }

        const data = docSnap.data()
        const propertiesArray = data.properties || []

        const foundProperty = propertiesArray.find(
          (prop) => prop.id === propertyId
        )

        if (!foundProperty) {
          toast.error('Property not found')
          navigate('/dashboard')
          return
        }

        setProperty(foundProperty)
      } catch (error) {
        toast.error('Error loading property')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId, navigate])

  const generatePosts = async (platform) => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property,
          platform,
        }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()

      // Update property with generated post
      const updatedPosts = { ...property.posts, [platform]: data.content }
      const docRef = doc(db, 'properties', auth.currentUser.uid)
      const docSnap = await getDoc(docRef)

      const data1 = docSnap.data()
      const propertiesArray = data1.properties || []

      const updatedProperties = propertiesArray.map((prop) => {
        if (prop.id === propertyId) {
          return {
            ...prop,
            posts: updatedPosts,
            postsGenerated: (prop.postsGenerated || 0) + 1,
          }
        }
        return prop
      })

      await updateDoc(docRef, {
        properties: updatedProperties,
      })

      setProperty((prev) => ({
        ...prev,
        posts: updatedPosts,
        postsGenerated: (prev.postsGenerated || 0) + 1,
      }))

      toast.success(`${platform} post generated!`)
    } catch (error) {
      toast.error('Error generating post: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleEditStart = (content) => {
    setEditingTab(activeTab)
    setEditContent(content)
  }

  const handleEditSave = async () => {
    try {
      const updatedPosts = {
        ...property.posts,
        [editingTab]: editContent,
      }

      const docRef = doc(db, 'properties', auth.currentUser.uid)
      const docSnap = await getDoc(docRef)

      const data = docSnap.data()
      const propertiesArray = data.properties || []

      const updatedProperties = propertiesArray.map((prop) => {
        if (prop.id === propertyId) {
          return {
            ...prop,
            posts: updatedPosts,
          }
        }
        return prop
      })

      await updateDoc(docRef, {
        properties: updatedProperties,
      })

      setProperty((prev) => ({
        ...prev,
        posts: updatedPosts,
      }))

      setEditingTab(null)
      toast.success('Post updated!')
    } catch (error) {
      toast.error('Error updating post')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading posts...</p>
        </div>
      </div>
    )
  }

  if (!property) return null

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'from-blue-600 to-blue-400',
      description: 'Long-form content',
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: Twitter,
      color: 'from-slate-600 to-slate-400',
      description: '~190 characters',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'from-pink-600 to-purple-600',
      description: 'Visual + caption',
    },
  ]

  const currentPlatform = platforms.find((p) => p.id === activeTab)
  const currentContent = property.posts?.[activeTab]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="gradient-text text-3xl font-bold mb-2">{property.name}</h1>
          <p className="text-slate-400">{property.location}</p>
        </motion.div>

        {/* Platform Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="flex gap-4 overflow-x-auto pb-2">
            {platforms.map((platform) => {
              const Icon = platform.icon
              const isActive = activeTab === platform.id
              return (
                <button
                  key={platform.id}
                  onClick={() => setActiveTab(platform.id)}
                  className={`tab-button flex items-center gap-2 whitespace-nowrap ${isActive ? 'active' : ''
                    }`}
                >
                  <Icon size={20} />
                  {platform.name}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card"
        >
          {/* Platform Info */}
          <div className={`bg-gradient-to-r ${currentPlatform.color} p-1 rounded-lg mb-6`}>
            <div className="bg-slate-900/90 rounded p-4">
              <p className="text-slate-300 text-sm">{currentPlatform.description}</p>
            </div>
          </div>

          {/* Content Display/Edit */}
          {editingTab === activeTab ? (
            <div className="space-y-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="form-textarea w-full"
                rows="8"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEditSave}
                  className="btn-primary flex items-center gap-2"
                >
                  <Check size={20} />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingTab(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {currentContent ? (
                <div className="space-y-4">
                  <div className="bg-slate-800/30 rounded-lg p-6 min-h-40 max-h-96 overflow-y-auto">
                    <p className="text-slate-100 whitespace-pre-wrap">{currentContent}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => copyToClipboard(currentContent)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Copy size={18} />
                      Copy
                    </button>
                    <button
                      onClick={() => handleEditStart(currentContent)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Edit2 size={18} />
                      Edit
                    </button>
                    <button
                      onClick={() => generatePosts(activeTab)}
                      disabled={generating}
                      className="btn-primary flex items-center gap-2"
                    >
                      {generating ? (
                        <Loader className="animate-spin" size={18} />
                      ) : (
                        <RotateCcw size={18} />
                      )}
                      Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className={`bg-gradient-to-r ${currentPlatform.color} p-3 rounded-lg w-fit mx-auto mb-4`}>
                    <currentPlatform.icon size={32} className="text-white" />
                  </div>
                  <p className="text-slate-400 mb-4">No post generated yet</p>
                  <button
                    onClick={() => generatePosts(activeTab)}
                    disabled={generating}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    {generating ? (
                      <Loader className="animate-spin" size={20} />
                    ) : (
                      <RotateCcw size={20} />
                    )}
                    Generate {currentPlatform.name} Post
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Property Images Reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-slate-100 mb-4">Property Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {property.images?.map((image, idx) => (
              <div key={idx} className="card-hover group">
                <img
                  src={image.url}
                  alt={image.name || `Image ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform duration-300"
                />
                <p className="text-sm font-semibold text-slate-300">{image.name}</p>
                <p className="text-xs text-slate-500">{image.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
