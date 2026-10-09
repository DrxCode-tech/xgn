import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ArrowLeft, CalendarClock, CheckCircle2, Loader } from 'lucide-react'
import { toast } from 'react-toastify'
import { db } from '../firebase'

const SESSIONS = ['Tokyo', 'Sydney', 'London', 'New York']
const DIRECTIONS = ['Buy', 'Sell']
const SUCCESS_VALUES = ['Yes', 'No']

function normalizePair(value = '') {
  return String(value ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
}

const INITIAL_FORM = {
  pair: '',
  entryDateTime: '',
  sessionTime: 'London',
  marketStructure: '',
  direction: 'Buy',
  entryPrice: '',
  sl: '',
  tp: '',
  rr: '',
  screenshotUrl: '',
  success: 'Yes',
  mistakesMade: '',
  improvementTips: '',
}

export default function NewJournal({ user }) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    const sanitizedValue = name === 'pair' ? normalizePair(value) : value
    setFormData((current) => ({ ...current, [name]: sanitizedValue }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!user?.uid) {
      toast.error('Please login before journaling a trade.')
      return
    }

    const normalizedPair = normalizePair(formData.pair)
    if (!normalizedPair) {
      toast.error('Please enter a valid forex pair.')
      return
    }

    setSaving(true)
    try {
      const tradeRef = await addDoc(collection(db, 'users', user.uid, 'trades'), {
        ...formData,
        pair: normalizedPair,
        rr: formData.rr === '' ? null : Number(formData.rr),
        entryPrice: Number(formData.entryPrice),
        sl: Number(formData.sl),
        tp: Number(formData.tp),
        createdAt: serverTimestamp(),
        userId: user.uid,
      })

      toast.success('Trade saved to Firebase.')
      navigate(`/journal/${tradeRef.id}`)
    } catch (error) {
      console.error('Trade save error:', error)
      toast.error('Could not save this trade.')
    } finally {
      setSaving(false)
    }
  }

  const handleScreenshotUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary cloud name or upload preset is missing.')
      return
    }

    setUploadingScreenshot(true)
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('upload_preset', uploadPreset)
      uploadData.append('folder', 'trade-journal-screenshots')

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: uploadData,
      })
      const uploadedImage = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadedImage.error?.message || 'Screenshot upload failed.')
      }

      setFormData((current) => ({ ...current, screenshotUrl: uploadedImage.secure_url }))
      toast.success('Screenshot uploaded.')
    } catch (error) {
      console.error('Screenshot upload error:', error)
      toast.error(error.message)
    } finally {
      setUploadingScreenshot(false)
      event.target.value = ''
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">New FX journal entry</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Record a Trade</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-lg p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-300">
            <CalendarClock size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Trade Details</h2>
            <p className="text-sm text-slate-400">Log your forex trade setup, execution, and review.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Pair"
            name="pair"
            value={formData.pair}
            onChange={handleChange}
            placeholder="EURUSD"
            required
          />
          <InputField
            label="Date & Time of Entry"
            name="entryDateTime"
            type="datetime-local"
            value={formData.entryDateTime}
            onChange={handleChange}
            required
          />
          <SelectField
            label="Session Time"
            name="sessionTime"
            value={formData.sessionTime}
            onChange={handleChange}
            options={SESSIONS}
          />
          <TextareaField
            label="Market Structure"
            name="marketStructure"
            value={formData.marketStructure}
            onChange={handleChange}
            required
          />
          <SelectField
            label="Buy/Sell"
            name="direction"
            value={formData.direction}
            onChange={handleChange}
            options={DIRECTIONS}
          />
          <InputField
            label="Entry Price"
            name="entryPrice"
            type="number"
            step="any"
            value={formData.entryPrice}
            onChange={handleChange}
            required
          />
          <InputField
            label="SL"
            name="sl"
            type="number"
            step="any"
            value={formData.sl}
            onChange={handleChange}
            required
          />
          <InputField
            label="TP"
            name="tp"
            type="number"
            step="any"
            value={formData.tp}
            onChange={handleChange}
            required
          />
          <InputField
            label="RR (Risk/Reward)"
            name="rr"
            type="number"
            min="0"
            step="0.01"
            value={formData.rr}
            onChange={handleChange}
            placeholder="2"
            required
          />
          <InputField
            label="Screenshot URL"
            name="screenshotUrl"
            type="url"
            value={formData.screenshotUrl}
            onChange={handleChange}
            placeholder="Upload image or paste a Cloudinary/chart URL"
          />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">Upload Screenshot</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              disabled={uploadingScreenshot}
              className="form-input file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-cyan-200"
            />
            <span className="mt-2 block text-xs text-slate-500">
              {uploadingScreenshot ? 'Uploading to Cloudinary...' : 'Upload your PNG/JPG. The URL field fills itself.'}
            </span>
          </label>
          <SelectField
            label="Success value"
            name="success"
            value={formData.success}
            onChange={handleChange}
            options={SUCCESS_VALUES}
          />
          <TextareaField label="Mistakes made" name="mistakesMade" value={formData.mistakesMade} onChange={handleChange} />
          <TextareaField
            label="Improvement Tips"
            name="improvementTips"
            value={formData.improvementTips}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={saving || uploadingScreenshot}
          className="btn-primary mt-5 flex w-full items-center justify-center gap-2"
        >
          {saving ? <Loader className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          {saving ? 'Saving trade...' : 'Save Trade'}
        </button>
      </form>
    </main>
  )
}

function InputField({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">{label}</span>
      <input className="form-input" {...props} />
    </label>
  )
}

function SelectField({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">{label}</span>
      <select className="form-input" {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextareaField({ label, ...props }) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-2 block text-sm font-semibold text-slate-300">{label}</span>
      <textarea className="form-textarea min-h-24" {...props} />
    </label>
  )
}
