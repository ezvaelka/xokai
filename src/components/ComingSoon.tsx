import { Clock } from 'lucide-react'

interface Props {
  title:       string
  description: string
  icon:        React.ReactNode
  eta?:        string
}

export default function ComingSoon({ title, description, icon, eta }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-xk-accent-light flex items-center justify-center mx-auto mb-6 text-xk-accent">
        {icon}
      </div>
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-xk-text mb-3">
        {title}
      </h1>
      <p className="text-xk-text-secondary text-base leading-relaxed max-w-md mb-6">
        {description}
      </p>
      {eta && (
        <span className="inline-flex items-center gap-1.5 bg-xk-subtle border border-xk-border rounded-full px-4 py-1.5 text-sm text-xk-text-secondary font-medium">
          <Clock size={14} />
          {eta}
        </span>
      )}
    </div>
  )
}
