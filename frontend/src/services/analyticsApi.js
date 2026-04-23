import { apiRequest } from './apiClient'

export const analyticsApi = {
  async adminSummary({ rangeDays = 30, topN = 5 } = {}) {
    const q = new URLSearchParams()
    if (rangeDays) q.set('rangeDays', String(rangeDays))
    if (topN) q.set('topN', String(topN))
    return apiRequest(`/api/admin/analytics/summary?${q.toString()}`)
  },
}

