import { getSysadminMetrics, listSchools } from '@/app/actions/sysadmin'
import DashboardClient from './DashboardClient'

export default async function SysadminDashboard() {
  const [m, schools] = await Promise.all([getSysadminMetrics(), listSchools('all')])
  return <DashboardClient metrics={m} schools={schools} />
}
