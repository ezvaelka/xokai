import { listTeachers } from '@/app/actions/teachers'
import MaestrosClient   from './MaestrosClient'

export default async function MaestrosPage() {
  const teachers = await listTeachers()

  return (
    <div className="max-w-4xl mx-auto">
      <MaestrosClient teachers={teachers} />
    </div>
  )
}
