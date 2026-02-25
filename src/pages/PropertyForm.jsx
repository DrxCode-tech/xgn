import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { CldUploadWidget } from 'next-cloudinary'
import { Home, MapPin, DollarSign, Plus, Trash2, Loader, Image as ImageIcon } from 'lucide-react'
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
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (result) => {
    if (result.event === 'success') {
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

    setLoading(true)

    try {
      const propertyData = {
        userId: auth.currentUser.uid,
        name: formData.name,
        location: formData.location,
        price: parseInt(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        description: formData.description,
        images: formData.images,
        createdAt: serverTimestamp(),
        postsGenerated: 0,
        posts: {
          facebook: null,
          twitter: null,
          instagram: null,
        },
      }

      const docRef = await addDoc(collection(db, 'properties'), propertyData)
      toast.success('Property created successfully!')
      navigate(`/posts/${docRef.id}`)
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="gradient-text text-3xl font-bold mb-2">Add New Property</h1>
            <p className="text-slate-400">Fill in the details to create a new property listing</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Property Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Home size={24} className="text-indigo-400" />
                Property Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Property Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Luxury Apartment in Victoria Island"
                    className="form-input"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-indigo-400" size={20} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Lagos, Nigeria"
                      className="form-input pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Price (₦)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-indigo-400" size={20} />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="50000000"
                      className="form-input pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="3"
                    className="form-input"
                    required
                  />
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="2"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the property, amenities, features, etc."
                  className="form-textarea"
                  rows="5"
                />
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-6 border-t border-indigo-500/10 pt-8">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <ImageIcon size={24} className="text-indigo-400" />
                Property Images
              </h2>

              {/* Upload Widget */}
              <CldUploadWidget
                uploadPreset={import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={handleImageUpload}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="btn-secondary w-full flex items-center justify-center gap-2 py-4"
                  >
                    <Plus size={20} />
                    Upload Image
                  </button>
                )}
              </CldUploadWidget>

              {/* Images List */}
              {formData.images.length > 0 && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">
                    {formData.images.length} image(s) uploaded
                  </p>
                  {formData.images.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/30 rounded-lg p-4 border border-indigo-500/10"
                    >
                      <div className="flex gap-4">
                        {/* Image Preview */}
                        <img
                          src={image.url}
                          alt={`Property ${index + 1}`}
                          className="w-24 h-24 rounded-lg object-cover"
                        />

                        {/* Image Details */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                              Image Name (e.g., Kitchen, Living Room)
                            </label>
                            <input
                              type="text"
                              value={image.name}
                              onChange={(e) =>
                                handleImageDescriptionChange(index, 'name', e.target.value)
                              }
                              placeholder="e.g., Kitchen"
                              className="form-input text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={image.description}
                              onChange={(e) =>
                                handleImageDescriptionChange(
                                  index,
                                  'description',
                                  e.target.value
                                )
                              }
                              placeholder="Describe this image..."
                              className="form-input text-sm"
                            />
                          </div>
                        </div>

                        {/* Remove Button */}
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

            {/* Submit Button */}
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
