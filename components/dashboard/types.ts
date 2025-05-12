export type Message = {
  id: string
  content: string
  sender: 'user' | 'bot' | 'agent'
  status?: 'typing' | 'searching' | 'analyzing' | 'complete'
  grantLinks?: string[]
}

export type Grant = {
  grant_name?: string
  description?: string
  id: string
  name: string
  agency: string
  deadline: string
  focus_area: string
  match_reason?: string
  budget_range?: string
  eligibility?: string[]
  url?: string
}

export type AnalysisResponse = {
  analysis_summary: string
  matched_grants: (Grant | string)[]
  next_steps: string[]
  follow_up_questions?: string[]
  confidence_score: number
}
