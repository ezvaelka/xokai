import { listGroups, listTeachersForSchool } from '@/app/actions/groups'
import GruposClient from './GruposClient'

export default async function GruposPage() {
  const [groups, teachers] = await Promise.all([listGroups(), listTeachersForSchool()])

  return (
    <div className="max-w-5xl mx-auto">
      <GruposClient groups={groups} teachers={teachers} />
    </div>
  )
}
