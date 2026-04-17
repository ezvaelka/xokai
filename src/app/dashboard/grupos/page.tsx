import { listGroups } from '@/app/actions/groups'
import GruposClient   from './GruposClient'

export default async function GruposPage() {
  const groups = await listGroups()

  return (
    <div className="max-w-5xl mx-auto">
      <GruposClient groups={groups} />
    </div>
  )
}
