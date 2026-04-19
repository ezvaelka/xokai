import { notFound }               from 'next/navigation'
import { getGroup, listTeachersForSchool } from '@/app/actions/groups'
import GroupDetailClient          from './GroupDetailClient'

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let detail, teachers
  try {
    ;[detail, teachers] = await Promise.all([getGroup(id), listTeachersForSchool()])
  } catch {
    notFound()
  }

  return <GroupDetailClient detail={detail!} teachers={teachers!} />
}
