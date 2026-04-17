import { listStudents } from '@/app/actions/students'
import { listGroups }   from '@/app/actions/groups'
import AlumnosClient    from './AlumnosClient'

export default async function AlumnosPage() {
  const [students, groups] = await Promise.all([
    listStudents({ active: undefined }),
    listGroups(),
  ])

  return (
    <div className="max-w-5xl mx-auto">
      <AlumnosClient students={students} groups={groups} />
    </div>
  )
}
