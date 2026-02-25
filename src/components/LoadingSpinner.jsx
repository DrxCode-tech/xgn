export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-slate-950 rounded-full"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-indigo-500 animate-spin"></div>
        </div>
        <p className="text-slate-300 text-lg font-semibold">Loading XGN...</p>
        <p className="text-slate-500 text-sm mt-2">Preparing your real estate workspace</p>
      </div>
    </div>
  )
}
