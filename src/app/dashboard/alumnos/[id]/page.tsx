import { notFound }         from 'next/navigation'
import DashboardShell        from '@/components/DashboardShell'
import { getStudent }        from '@/app/actions/students'
import { listGroups }        from '@/app/actions/groups'
import StudentDetailContent  from './StudentDetailContent'

export default async function AlumnoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let student, groups
  try {
    ;[student, groups] = await Promise.all([getStudent(id), listGroups()])
  } catch {
    notFound()
  }

  return (
    <DashboardShell activeHref="/dashboard/alumnos">
      <StudentDetailContent student={student} groups={groups} />
    </DashboardShell>
  )
}
