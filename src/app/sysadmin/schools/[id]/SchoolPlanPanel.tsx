'use client'

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { toast }                   from 'sonner'
import { Loader2 }                 from 'lucide-react'
import { updateSchoolPlan, extendTrial, type SchoolPlan, PLAN_LABELS } from '@/app/actions/sysadmin'

const PLANS: SchoolPlan[] = ['trial', 'base', 'base_pickup', 'suspended', 'churned']

type Props = {
  schoolId:    string
  currentPlan: SchoolPlan
  trialEndsAt: string | null
}

export default function SchoolPlanPanel({ schoolId, currentPlan, trialEndsAt }: Props) {
  const router              = useRouter()
  const [pending, start]    = useTransition()
  const [plan, setPlan]     = useState<SchoolPlan>(currentPlan)
  const [days, setDays]     = useState(14)
  const [action, setAction] = useState<'plan' | 'trial' | null>(null)

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null

  async function savePlan() {
    setAction('plan')
    start(async () => {
      const res = await updateSchoolPlan(schoolId, plan)
      setAction(null)
      if (res.error) toast.error(res.error)
      else { toast.success('Plan actualizado'); router.refresh() }
    })
  }

  async function saveExtend() {
    setAction('trial')
    start(async () => {
      const res = await extendTrial(schoolId, days)
      setAction(null)
      if (res.error) toast.error(res.error)
      else { toast.success(`Trial extendido ${days} días`); router.refresh() }
    })
  }

  return (
    <div className="space-y-4">
      {/* Cambiar plan */}
      <div className="xk-surface-elevated p-5">
        <h3 className="text-sm font-semibold text-xk-text mb-4">Plan contratado</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {PLANS.map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                plan === p
                  ? 'bg-xk-accent text-white border-xk-accent'
                  : 'bg-xk-surface text-xk-text-secondary border-xk-border hover:bg-xk-subtle'
              }`}
            >
              {PLAN_LABELS[p]}
            </button>
          ))}
        </div>
        <button
          onClick={savePlan}
          disabled={pending || plan === currentPlan}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark disabled:opacity-40 transition-colors"
        >
          {pending && action === 'plan' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {plan === currentPlan ? 'Sin cambios' : `Guardar → ${PLAN_LABELS[plan]}`}
        </button>

        {plan === 'suspended' && (
          <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mt-3">
            Al suspender, la escuela perderá acceso a la plataforma de inmediato.
          </p>
        )}
      </div>

      {/* Extender trial */}
      <div className="xk-surface-elevated p-5">
        <h3 className="text-sm font-semibold text-xk-text mb-1">Extender trial</h3>
        {daysLeft !== null && (
          <p className="text-xs text-xk-text-muted mb-3">
            Trial actual: <span className="xk-num font-semibold text-xk-text">{daysLeft}</span> días restantes
            {trialEndsAt && ` (vence ${new Date(trialEndsAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })})`}
          </p>
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {[7, 14, 30, 60].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  days === d
                    ? 'bg-xk-accent text-white border-xk-accent'
                    : 'bg-xk-surface text-xk-text-secondary border-xk-border hover:bg-xk-subtle'
                }`}
              >
                +{d}d
              </button>
            ))}
          </div>
          <button
            onClick={saveExtend}
            disabled={pending}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-xk-subtle text-xk-text-secondary text-xs font-medium hover:bg-xk-border/50 disabled:opacity-40 transition-colors"
          >
            {pending && action === 'trial' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Extender
          </button>
        </div>
      </div>
    </div>
  )
}
