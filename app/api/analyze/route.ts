import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ApifyClient } from 'apify-client'

interface UserMessage {
  role: string;
  content: string;
}

interface LinkedInData {
  [key: string]: unknown;
}

interface Grant {
  id: string;
  name: string;
  grant_name: string;
  agency: string;
  deadline: string;
  focus_area: string;
  description: string;
  match_reason: string;
  budget_range: string;
  eligibility: string[];
  url: string;
}

interface ClaudeResponse {
    analysis_summary: string;
    matched_grants: Grant[];
    follow_up_questions: string[];
    next_steps: string[];
    confidence_score: number;
}

interface MessageContent {
    type: string;
    text?: string;
}

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN })
const GRANTS_ENDPOINT = 'https://www.grants.gov/grantsws/rest/opportunities/search'

async function fetchGrants(query: string): Promise<Grant[]> {
  const params = new URLSearchParams({
    api_key: process.env.GRANTS_GOV_API_KEY || '',
    keyword: query,
    oppStatuses: 'open',
    sortBy: 'postedDate',
    sortOrder: 'desc',
    pageSize: '10'
  })
  const res = await fetch(`${GRANTS_ENDPOINT}?${params.toString()}`)
  if (!res.ok) return []
  const data = await res.json()
  return data?.opportunities || []
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userMessages = body.messages as UserMessage[]
    const linkedInUrl = body.linkedInUrl as string | undefined

    let linkedInData: LinkedInData | null = null
    if (linkedInUrl) {
      try {
        const run = await apifyClient.actor('2SyF0bVxmgGr8IVCZ').call({
          profileUrls: [linkedInUrl],
          extendOutput: true,
          timeoutSecs: 120
        })
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems()
        linkedInData = items[0] as LinkedInData || null
      } catch (error) {
        console.error('Error fetching LinkedIn data:', error)
      }
    }

    const lastUser = userMessages?.length ? userMessages[userMessages.length - 1].content : ''
    const keyword = (lastUser.match(/\b([\w-]{4,})\b/g) || []).slice(0, 5).join(' ') || 'health'
    const grants = await fetchGrants(keyword)
    const grantsContext = JSON.stringify(grants.slice(0, 5))

    const systemPrompt = `You are MediGrant AI, a healthcare funding expert. Your ONLY goal is to generate grant analysis responses in valid strict JSON format, and absolutely NOTHING ELSE.

CRITICAL RULES:
- You MUST output ONLY a valid JSON object.
- Do NOT add ANY natural language explanations, apologies, comments, or formatting.
- Do NOT wrap the JSON in markdown.
- If you cannot find enough information, you MUST still output a properly filled JSON object with "Unknown" or "Not Available" values where necessary, but NEVER write natural sentences outside JSON.

Use the following Grants.gov data to improve accuracy: ${grantsContext}

If LinkedIn data is available it is provided after this colon: ${JSON.stringify(linkedInData)}.

Respond using this exact structure:
{"analysis_summary":"","matched_grants":[{"id":"","name":"","grant_name":"","agency":"","deadline":"","focus_area":"","description":"","match_reason":"","budget_range":"","eligibility":[],"url":""}],"follow_up_questions":[],"next_steps":[],"confidence_score":0.0}
No exceptions.`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      system: systemPrompt,
      messages: userMessages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    })

    const text = message.content
      .filter((c: MessageContent) => c.type === 'text')
      .map((c: MessageContent) => c.text)
      .join('')
      .trim()

    try {
      const jsonResponse: ClaudeResponse = JSON.parse(text)
      return NextResponse.json(jsonResponse)
    } catch {
      const match = text.match(/(\{[\s\S]*\})/)
      if (match) {
        try {
          const jsonResponse: ClaudeResponse = JSON.parse(match[1])
          return NextResponse.json(jsonResponse)
        } catch (error) {
          console.error('Error parsing JSON response:', error)
        }
      }
    }
    throw new Error('Claude returned an invalid JSON response.')
  } catch (err: unknown) {
    const error = err as Error
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Analysis failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}