export type Message = {
  id: string
  content: string
  sender: 'user' | 'bot' | 'agent'
  timestamp: Date
  linkedGrantData?: LinkedGrantInfo[]
  status?: 'typing' | 'analyzing' | 'searching' | 'complete'
  followUpQuestions?: string[]
}

export type Grant = {
  id: string
  grant_name?: string 
  name?: string      
  agency: string
  description: string
  deadline: string
  focus_area: string
  match_reason?: string
  amount?: number | string;
  status?: string;
  link?: string;
};

export type LinkedGrantInfo = Pick<Grant, 'id' | 'name' | 'agency' | 'deadline' | 'focus_area'> & { grant_name?: string };

export type AnalysisResponse = {
  analysis_summary: string
  matched_grants: (Grant | string)[]
  next_steps: string[]
  follow_up_questions?: string[]
  confidence_score: number
}
