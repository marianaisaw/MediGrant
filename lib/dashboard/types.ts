export type Message = {
  id: string
  content: string
  sender: 'user' | 'bot' | 'agent'
  status?: 'typing' | 'searching' | 'analyzing' | 'complete'
  grantLinks?: string[]
}

export type Grant = {
  id: string
  title?: string          // For dashboard display
  name?: string           // Original field
  grant_name?: string     // Alternative field
  description?: string
  funder?: string         // For dashboard display
  agency?: string         // Original field
  amount?: number         // For dashboard display (numeric value)
  budget_range?: string   // Original field (string format)
  deadline: string
  focus_area?: string
  match_reason?: string
  eligibility?: string[]
  url?: string
  tags?: string[]         // For dashboard display
}

export type AnalysisResponse = {
  analysis_summary: string
  matched_grants: (Grant | string)[]
  next_steps: string[]
  follow_up_questions?: string[]
  confidence_score: number
}
