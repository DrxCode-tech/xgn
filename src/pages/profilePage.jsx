import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Phone, MessageCircle, Award, ShieldCheck, Loader } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', userId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProfile(docSnap.data())
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <Loader className="animate-spin text-indigo-500" size={40} />
      </div>
    )
  }

  if (!profile) return null

  const whatsappLink = profile.phone
    ? `https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}`
    : null

  const qualified = profile.profileComplete

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card p-10 relative overflow-hidden"
        >
          {/* Top Section */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-indigo-500/30 shadow-2xl">
                <img
                  src={profile.profilePhoto || 'https://via.placeholder.com/400'}
                  alt="Agent"
                  className="w-full h-full object-cover"
                />
              </div>

              {qualified && (
                <div className="absolute -bottom-3 -right-3 bg-indigo-600 p-2 rounded-full shadow-lg">
                  <ShieldCheck size={22} className="text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">
                {profile.fullName}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-300 mb-4">
                <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-2 rounded-lg">
                  <Award size={18} className="text-indigo-400" />
                  <span>{profile.experience || 0}+ Years Experience</span>
                </div>

                {qualified && (
                  <div className="flex items-center gap-2 bg-indigo-600/20 px-4 py-2 rounded-lg border border-indigo-500/40">
                    <ShieldCheck size={18} className="text-indigo-400" />
                    <span className="text-indigo-300 font-semibold">XGN Qualified Agent</span>
                  </div>
                )}
              </div>

              <p className="text-slate-400 leading-relaxed max-w-2xl">
                {profile.bio || 'Professional real estate agent ready to help you find the perfect property.'}
              </p>

              {/* Contact Buttons */}
              <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Phone size={18} />
                    Call Agent
                  </a>
                )}

                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 my-10"></div>

          {/* Professional Stats Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-white">{profile.experience || 0}+</h3>
              <p className="text-slate-400 text-sm">Years in Real Estate</p>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-white">Trusted</h3>
              <p className="text-slate-400 text-sm">Client Focused Service</p>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-white">Verified</h3>
              <p className="text-slate-400 text-sm">Identity & Profile Confirmed</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
