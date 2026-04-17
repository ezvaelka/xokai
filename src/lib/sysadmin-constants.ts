export type SchoolPlan = 'trial' | 'base' | 'base_pickup' | 'suspended' | 'churned'

export const PLAN_LABELS: Record<SchoolPlan, string> = {
  trial:        'Trial',
  base:         'Base · $7/alumno',
  base_pickup:  'Base + Pickup · $9/alumno',
  suspended:    'Suspendida',
  churned:      'Churned',
}

export const PLAN_RATE_USD: Record<SchoolPlan, number> = {
  trial:        0,
  base:         7,
  base_pickup:  9,
  suspended:    0,
  churned:      0,
}
