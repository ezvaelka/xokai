export default function AlumnosLoading() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-7 w-20 bg-xk-subtle rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-xk-subtle rounded animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-xk-subtle rounded-xl animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="h-9 flex-1 min-w-[200px] bg-xk-subtle rounded-xl animate-pulse" />
        <div className="h-9 w-32 bg-xk-subtle rounded-xl animate-pulse" />
        <div className="h-9 w-48 bg-xk-subtle rounded-xl animate-pulse" />
      </div>
      <div className="bg-xk-card border border-xk-border rounded-2xl overflow-hidden">
        <div className="h-10 bg-xk-subtle border-b border-xk-border" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-xk-border last:border-0">
            <div className="w-8 h-8 rounded-full bg-xk-subtle animate-pulse shrink-0" />
            <div className="flex-1 h-4 bg-xk-subtle rounded animate-pulse" />
            <div className="w-24 h-4 bg-xk-subtle rounded animate-pulse" />
            <div className="w-32 h-4 bg-xk-subtle rounded animate-pulse hidden lg:block" />
            <div className="w-20 h-4 bg-xk-subtle rounded animate-pulse" />
            <div className="w-14 h-5 bg-xk-subtle rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
