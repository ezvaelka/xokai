import { notFound }              from 'next/navigation'
import { getStudent }             from '@/app/actions/students'
import { listGroups }             from '@/app/actions/groups'
import { listAuthorizedPickups }  from '@/app/actions/authorized-pickups'
import StudentDetailContent       from './StudentDetailContent'

export default async function AlumnoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let student, groups, authorizedPickups
  try {
    ;[student, groups, authorizedPickups] = await Promise.all([
      getStudent(id),
      listGroups(),
      listAuthorizedPickups(id),
    ])
  } catch {
    notFound()
  }

  return (
    <StudentDetailContent
      student={student!}
      groups={groups!}
      authorizedPickups={authorizedPickups!}
    />
  )
}
