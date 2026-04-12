// Shimmer skeleton card for loading states
export function SkeletonCard({ tall = false }) {
  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-sm ${tall ? 'h-64' : 'h-48'}`}>
      <div className="shimmer w-full h-3/5" />
      <div className="p-4 space-y-2">
        <div className="shimmer h-4 w-3/4 rounded-full" />
        <div className="shimmer h-3 w-full rounded-full" />
        <div className="shimmer h-3 w-1/2 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonCircle() {
  return (
    <div className="flex-none w-20 text-center">
      <div className="w-20 h-20 rounded-full shimmer mx-auto mb-2" />
      <div className="shimmer h-3 w-14 rounded-full mx-auto" />
    </div>
  )
}

export function SkeletonBanner() {
  return (
    <div className="shimmer rounded-xl h-40 w-full" />
  )
}
