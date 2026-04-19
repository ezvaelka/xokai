import { notFound }         from 'next/navigation'
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

  return <StudentDetailContent student={student!} groups={groups!} />
}
