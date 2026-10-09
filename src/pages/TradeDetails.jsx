import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteDoc, doc, getDoc } from 'firebase/firestore'
import { ArrowLeft, ExternalLink, ImageOff, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { db } from '../firebase'

function normalizePair(value = '') {
  return String(value ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
}

function formatEntryDate(value) {
  if (!value) return 'No date'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export default function TradeDetails({ user }) {
  const { tradeId } = useParams()
  const [trade, setTrade] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTrade = async () => {
      if (!user?.uid || !tradeId) return

      try {
        const tradeSnap = await getDoc(doc(db, 'users', user.uid, 'trades', tradeId))

        if (!tradeSnap.exists()) {
          toast.error('Trade not found.')
          setTrade(null)
          return
        }

        setTrade({ id: tradeSnap.id, ...tradeSnap.data() })
      } catch (error) {
        console.error('Trade detail fetch error:', error)
        toast.error('Could not load this trade.')
      } finally {
        setLoading(false)
      }
    }

    fetchTrade()
  }, [tradeId, user?.uid])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="glass rounded-lg p-5 text-slate-300">Loading trade details...</div>
      </main>
    )
  }

  if (!trade) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
        <div className="glass rounded-lg p-5 text-slate-300">This trade could not be found.</div>
      </main>
    )
  }

  const successClass = trade.success === 'Yes' ? 'badge-success' : 'badge-error'
  const rrValue = trade.rr == null || trade.rr === '' ? 'Not recorded' : `1:${Number(trade.rr)}`

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this trade from your journal?')
    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'trades', trade.id))
      toast.success('Trade deleted.')
      navigate('/dashboard')
    } catch (error) {
      console.error('Trade delete error:', error)
      toast.error('Could not delete this trade.')
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">FX trade details</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{normalizePair(trade.pair)}</h1>
          <p className="mt-2 text-sm text-slate-300">{formatEntryDate(trade.entryDateTime)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-primary">{trade.direction}</span>
          <span className={`badge ${successClass}`}>{trade.success === 'Yes' ? 'Win' : 'Loss'}</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
          >
            <Trash2 size={16} />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="glass rounded-lg p-5">
          <h2 className="mb-4 text-xl font-bold text-white">Trade Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Detail label="Session Time" value={trade.sessionTime} />
            <Detail label="Entry Price" value={trade.entryPrice} />
            <Detail label="SL" value={trade.sl} />
            <Detail label="TP" value={trade.tp} />
            <Detail label="RR (Risk/Reward)" value={rrValue} />
            <Detail label="Market Structure" value={trade.marketStructure} wide />
            <Detail label="Mistakes made" value={trade.mistakesMade || 'None recorded'} wide />
            <Detail label="Improvement Tips" value={trade.improvementTips || 'None recorded'} wide />
          </div>
        </div>

        <aside className="glass rounded-lg p-5">
          <h2 className="mb-4 text-xl font-bold text-white">Trade Screenshot</h2>
          {trade.screenshotUrl ? (
            <div>
              <a href={trade.screenshotUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
                <img
                  src={trade.screenshotUrl}
                  alt={`${normalizePair(trade.pair)} trade screenshot`}
                  className="max-h-[520px] w-full rounded-lg object-contain"
                />
              </a>
              <a
                href={trade.screenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                <ExternalLink size={16} />
                Open full image
              </a>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-indigo-500/10 bg-slate-900/50 text-slate-400">
              <ImageOff className="mb-3 text-slate-500" size={34} />
              No screenshot saved for this trade.
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}

function Detail({ label, value, wide = false }) {
  return (
    <div className={`rounded-lg bg-slate-900/50 p-4 ${wide ? 'md:col-span-2' : ''}`}>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold text-slate-200">{value || 'Not recorded'}</p>
    </div>
  )
}
