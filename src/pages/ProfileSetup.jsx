import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { CldUploadWidget } from 'next-cloudinary'
import { User, Phone, FileText, Award, Loader, Check } from 'lucide-react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

export default function ProfileSetup() {
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    bio: '',
    experience: '',
    profilePhoto: '',
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setProfileData((prev) => ({
            ...prev,
            fullName: data.fullName || '',
            profilePhoto: data.profilePhoto || '',
          }))
        }
      } catch (error) {
        toast.error('Error loading profile')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = (result) => {
    if (result.event === 'success') {
      setProfileData((prev) => ({
        ...prev,
        profilePhoto: result.info.secure_url,
      }))
      toast.success('Photo uploaded successfully')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        fullName: profileData.fullName,
        phone: profileData.phone,
        bio: profileData.bio,
        experience: profileData.experience,
        profilePhoto: profileData.profilePhoto,
        profileComplete: true,
      })

      toast.success('Profile updated successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="gradient-text text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-slate-400">Set up your professional profile to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-4">Profile Photo</label>
              <div className="flex items-center gap-6">
                {profileData.profilePhoto && (
                  <img
                    src={profileData.profilePhoto}
                    alt="Profile"
                    className="w-24 h-24 rounded-lg object-cover border-2 border-indigo-500/30"
                  />
                )}
                <CldUploadWidget
                  uploadPreset={import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={handlePhotoUpload}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="btn-secondary"
                    >
                      Upload Photo
                    </button>
                  )}
                </CldUploadWidget>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-indigo-400" size={20} />
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-indigo-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  placeholder="+234 (0) 123 456 7890"
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Bio</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-indigo-400" size={20} />
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className="form-textarea pl-10"
                  rows="4"
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Years of Experience</label>
              <div className="relative">
                <Award className="absolute left-3 top-3 text-indigo-400" size={20} />
                <input
                  type="number"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  className="form-input pl-10"
                  min="0"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Complete Profile
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
