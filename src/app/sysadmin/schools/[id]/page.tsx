import Link              from 'next/link'
import { notFound }      from 'next/navigation'
import { ArrowLeft }     from 'lucide-react'
import { getSchoolDetail, getSchoolNotes, getActivityLog } from '@/app/actions/sysadmin'
import SchoolDetailClient from './SchoolDetailClient'

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let detail, notes, activityLog
  try {
    ;[detail, notes, activityLog] = await Promise.all([
      getSchoolDetail(id),
      getSchoolNotes(id),
      getActivityLog(id),
    ])
  } catch {
    notFound()
  }

  const schoolData = detail!.school as Record<string, unknown>
  const plan       = (schoolData.plan as string ?? 'trial') as import('@/app/actions/sysadmin').SchoolPlan
  const trialEndsAt = (schoolData.trial_ends_at as string | null) ?? null

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/sysadmin/schools"
        className="inline-flex items-center gap-1.5 text-sm text-xk-text-secondary hover:text-xk-text mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Escuelas
      </Link>

      <SchoolDetailClient
        detail={detail!}
        notes={notes!}
        activityLog={activityLog!}
        plan={plan}
        trialEndsAt={trialEndsAt}
      />
    </div>
  )
}
