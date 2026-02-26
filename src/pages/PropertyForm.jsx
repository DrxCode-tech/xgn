import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { doc, setDoc, arrayUnion } from 'firebase/firestore'
import { Home, MapPin, DollarSign, Plus, Trash2, Loader, Image as ImageIcon, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

export default function PropertyForm() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    images: [],
    tone: 'Luxury/Sophisticated',
    customTone: '',
    brandHashtags: '',
    brandPhone: '',
    brandWebsite: '',
  })

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      toast.error('Cloudinary not loaded')
      return
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'camera'],
        multiple: false,
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          const newImage = {
            url: result.info.secure_url,
            description: '',
            name: '',
          }

          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, newImage],
          }))

          toast.success('Image uploaded!')
        }
      }
    )

    widget.open()
  }

  const handleImageDescriptionChange = (index, field, value) => {
    setFormData((prev) => {
      const newImages = [...prev.images]
      newImages[index][field] = value
      return { ...prev, images: newImages }
    })
  }

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    toast.info('Image removed')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    const propertyId = crypto.randomUUID()
    setLoading(true)

    try {
      const propertyData = {
        id: propertyId,
        userId: auth.currentUser.uid,
        name: formData.name,
        location: formData.location,
        price: parseInt(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        description: formData.description,
        images: formData.images,
        tone:
          formData.tone === 'Custom'
            ? formData.customTone
            : formData.tone,
        brandKit: {
          hashtags: formData.brandHashtags,
          phone: formData.brandPhone,
        },
        createdAt: new Date(),
        postsGenerated: 0,
        posts: {
          facebook: null,
          twitter: null,
          instagram: null,
        },
      }

      const docRef = doc(db, 'properties', auth.currentUser.uid)
      await setDoc(
        docRef,
        {
          properties: arrayUnion(propertyData),
        },
        { merge: true }
      )

      toast.success('Property saved successfully!')
      navigate(`/posts/${propertyId}`)
    } catch (error) {
      toast.error('Error creating property: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <div className="mb-8">
            <h1 className="gradient-text text-3xl font-bold mb-2">Add New Property</h1>
            <p className="text-slate-400">Fill in the details to create a new property listing</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Property Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Home size={24} className="text-indigo-400" />
                Property Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Property Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-indigo-400" size={20} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="form-input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Price (₦)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-indigo-400" size={20} />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="form-input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="5"
                />
              </div>
            </div>

            {/* Brand & Tone Section */}
            <div className="space-y-6 border-t border-indigo-500/10 pt-8">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Sparkles size={24} className="text-indigo-400" />
                Brand Voice & Tone
              </h2>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Select Tone</label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option>Luxury/Sophisticated</option>
                  <option>High-Energy/Hype</option>
                  <option>Professional/Informative</option>
                  <option>Custom</option>
                </select>
              </div>

              {formData.tone === 'Custom' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Custom Tone</label>
                  <input
                    type="text"
                    name="customTone"
                    value={formData.customTone}
                    onChange={handleChange}
                    placeholder="Describe your desired tone..."
                    className="form-input"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Default Hashtags</label>
                  <input
                    type="text"
                    name="brandHashtags"
                    value={formData.brandHashtags}
                    onChange={handleChange}
                    placeholder="#LagosRealEstate #LuxuryLiving"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
                  <input
                    type="text"
                    name="brandPhone"
                    value={formData.brandPhone}
                    onChange={handleChange}
                    placeholder="e.g., +2348012345678"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-6 border-t border-indigo-500/10 pt-8">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <ImageIcon size={24} className="text-indigo-400" />
                Property Images
              </h2>

              <button
                type="button"
                onClick={openCloudinaryWidget}
                className="btn-secondary w-full flex items-center justify-center gap-2 py-4"
              >
                <Plus size={20} />
                Upload Image
              </button>

              {formData.images.length > 0 && (
                <div className="space-y-4">
                  {formData.images.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/10"
                    >
                      <div className="flex gap-4">
                        <img
                          src={image.url}
                          alt={`Property ${index + 1}`}
                          className="w-24 h-24 rounded-lg object-cover"
                        />

                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={image.name}
                            onChange={(e) =>
                              handleImageDescriptionChange(index, 'name', e.target.value)
                            }
                            placeholder="Image Name"
                            className="form-input text-sm"
                          />

                          <input
                            type="text"
                            value={image.description}
                            onChange={(e) =>
                              handleImageDescriptionChange(index, 'description', e.target.value)
                            }
                            placeholder="Image Description"
                            className="form-input text-sm"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="btn-icon text-red-400 hover:bg-red-500/20 self-start"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-8 border-t border-indigo-500/10">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Create Property
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
