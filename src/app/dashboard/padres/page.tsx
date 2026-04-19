import { listParents } from '@/app/actions/parents'
import PadresClient   from './PadresClient'

export default async function PadresPage() {
  const parents = await listParents()

  return (
    <div className="max-w-4xl mx-auto">
      <PadresClient parents={parents} />
    </div>
  )
}
