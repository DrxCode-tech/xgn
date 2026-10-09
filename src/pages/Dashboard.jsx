import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { BarChart3, CheckCircle2, ClipboardList, Eye, Plus, Target, Trash2, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { db } from '../firebase'

function normalizePair(value = '') {
  return String(value ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
}

function percent(wins, total) {
  if (!total) return '0%'
  return `${Math.round((wins / total) * 100)}%`
}

function formatEntryDate(value) {
  if (!value) return 'No date'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export default function Dashboard({ user }) {
  const [trades, setTrades] = useState([])
  const [loadingTrades, setLoadingTrades] = useState(true)
  const [selectedPair, setSelectedPair] = useState('')

  useEffect(() => {
    if (!user?.uid) return undefined

    const tradesRef = collection(db, 'users', user.uid, 'trades')
    const tradesQuery = query(tradesRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      tradesQuery,
      (snapshot) => {
        setTrades(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setLoadingTrades(false)
      },
      (error) => {
        console.error('Trade fetch error:', error)
        toast.error('Could not load your trade journal yet.')
        setLoadingTrades(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  const stats = useMemo(() => {
    const pairStats = {}

    trades.forEach((trade) => {
      const pair = normalizePair(trade.pair)
      if (!pair) return

      if (!pairStats[pair]) {
        pairStats[pair] = { total: 0, wins: 0 }
      }

      pairStats[pair].total += 1
      if (trade.success === 'Yes') pairStats[pair].wins += 1
    })

    const normalizedStats = Object.fromEntries(
      Object.entries(pairStats).map(([pair, data]) => [pair, { ...data, winRate: percent(data.wins, data.total) }])
    )

    const sortedPairs = Object.keys(normalizedStats).sort()
    let wins = 0
    trades.forEach((trade) => {
      if (trade.success === 'Yes') wins += 1
    })

    const mostTradedPair =
      sortedPairs.reduce((highest, pair) => {
        const total = normalizedStats[pair].total
        return total > highest.total ? { pair, total } : highest
      }, { pair: 'None yet', total: 0 }).pair

    return {
      totalTrades: trades.length,
      overallWinRate: percent(wins, trades.length),
      winningTrades: wins,
      mostTradedPair,
      pairStats: normalizedStats,
      sortedPairs,
    }
  }, [trades])

  const visibleTrades = useMemo(() => {
    if (!selectedPair) return trades
    return trades.filter((trade) => normalizePair(trade.pair) === selectedPair)
  }, [selectedPair, trades])

  const handleDeleteTrade = async (tradeId) => {
    const confirmed = window.confirm('Delete this trade from your journal?')
    if (!confirmed) return

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'trades', tradeId))
      toast.success('Trade deleted.')
    } catch (error) {
      console.error('Trade delete error:', error)
      toast.error('Could not delete this trade.')
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">FX journal</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Trade Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Track your forex performance across every pair you trade and review each setup in context.
          </p>
        </div>

        <Link to="/journal/new" className="btn-primary inline-flex items-center justify-center gap-2">
          <Plus size={18} />
          Record Trade
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<ClipboardList size={22} />} label="Trades taken" value={stats.totalTrades} accent="text-cyan-300" />
        <StatCard icon={<Target size={22} />} label="Overall win rate" value={stats.overallWinRate} accent="text-emerald-300" />
        <StatCard icon={<TrendingUp size={22} />} label="Most traded pair" value={stats.mostTradedPair} accent="text-amber-300" />
        <StatCard icon={<CheckCircle2 size={22} />} label="Winning trades" value={stats.winningTrades} accent="text-rose-300" />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.sortedPairs.length === 0 ? (
          <div className="glass rounded-lg p-4 text-sm text-slate-300 md:col-span-2 xl:col-span-4">
            No pairs recorded yet. Your dashboard will populate as soon as you log your first trade.
          </div>
        ) : (
          stats.sortedPairs.map((pair) => {
            const isSelected = selectedPair === pair
            return (
              <button
                key={pair}
                type="button"
                onClick={() => setSelectedPair(isSelected ? '' : pair)}
                className={`glass rounded-lg p-4 text-left transition ${isSelected ? 'border border-cyan-400/60 bg-cyan-500/10' : 'hover:border-cyan-400/40'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">{pair}</span>
                  <BarChart3 className="text-cyan-300" size={18} />
                </div>
                <p className="mt-3 text-3xl font-bold text-white">{stats.pairStats[pair].winRate}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {stats.pairStats[pair].wins} wins from {stats.pairStats[pair].total} trades
                </p>
              </button>
            )
          })
        )}
      </section>

      <section className="glass mt-8 rounded-lg p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{selectedPair ? `${selectedPair} trade history` : 'Journaled Trades'}</h2>
            <p className="text-sm text-slate-400">
              {selectedPair ? 'Only trades for this pair are visible below.' : 'Click any pair to filter the history below.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedPair && (
              <button type="button" onClick={() => setSelectedPair('')} className="badge badge-primary cursor-pointer">
                View all pairs
              </button>
            )}
            <span className="badge badge-primary w-fit">{visibleTrades.length} total</span>
          </div>
        </div>

        <div className="max-h-[640px] space-y-3 overflow-y-auto pr-2">
          {loadingTrades ? (
            <div className="rounded-lg border border-indigo-500/10 bg-slate-900/40 p-4 text-slate-300">
              Loading trades...
            </div>
          ) : visibleTrades.length === 0 ? (
            <div className="rounded-lg border border-indigo-500/10 bg-slate-900/40 p-5 text-slate-300">
              {selectedPair
                ? `No trades recorded for ${selectedPair} yet.`
                : 'No trades recorded yet. Use the Record Trade button to add your first forex trade.'}
            </div>
          ) : (
            visibleTrades.map((trade) => <TradeListItem key={trade.id} trade={trade} onDelete={handleDeleteTrade} />)
          )}
        </div>
      </section>
    </main>
  )
}

function StatCard({ icon, label, value, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-lg p-5">
      <div className={`mb-4 inline-flex rounded-lg bg-slate-800/70 p-2 ${accent}`}>{icon}</div>
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </motion.div>
  )
}

function TradeListItem({ trade, onDelete }) {
  const successClass = trade.success === 'Yes' ? 'badge-success' : 'badge-error'
  const rrValue = trade.rr == null || trade.rr === '' ? 'RR N/A' : `RR 1:${Number(trade.rr)}`

  return (
    <Link
      to={`/journal/${trade.id}`}
      className="block rounded-lg border border-indigo-500/10 bg-slate-900/50 p-4 transition hover:border-cyan-400/40 hover:bg-slate-900/80"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white">{normalizePair(trade.pair)}</h3>
            <span className="badge badge-primary">{trade.direction}</span>
            <span className={`badge ${successClass}`}>{trade.success === 'Yes' ? 'Win' : 'Loss'}</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{formatEntryDate(trade.entryDateTime)}</p>
          <p className="mt-2 text-sm font-semibold text-slate-300">{rrValue}</p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:min-w-56">
          <div className="text-sm text-slate-300">
            <p>{trade.sessionTime}</p>
            <p>{trade.marketStructure || 'No structure noted'}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Eye size={16} />
            View
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onDelete(trade.id)
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
            title="Delete trade"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Link>
  )
}
