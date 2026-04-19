export default function PadresLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-7 w-16 bg-xk-subtle rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-xk-subtle rounded animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-xk-subtle rounded-xl animate-pulse" />
      </div>
      <div className="bg-xk-card border border-xk-border rounded-2xl overflow-hidden">
        <div className="h-10 bg-xk-subtle border-b border-xk-border" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-xk-border last:border-0">
            <div className="w-10 h-10 rounded-full bg-xk-subtle animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 bg-xk-subtle rounded animate-pulse" />
              <div className="h-3 w-48 bg-xk-subtle rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
