import { listAnnouncements } from '@/app/actions/announcements'
import { listGroups }        from '@/app/actions/groups'
import ComunicadosClient     from './ComunicadosClient'

export default async function ComunicadosPage() {
  const [announcements, groups] = await Promise.all([
    listAnnouncements(),
    listGroups(),
  ])

  return (
    <div className="max-w-3xl mx-auto">
      <ComunicadosClient announcements={announcements} groups={groups} />
    </div>
  )
}
