import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ApifyClient } from 'apify-client'

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userMessages = body.messages
    const linkedInUrl = body.linkedInUrl

    // Scrape LinkedIn if URL provided
    let linkedInData = null
    if (linkedInUrl) {
      try {
        const run = await apifyClient.actor("2SyF0bVxmgGr8IVCZ").call({
          profileUrls: [linkedInUrl],
          extendOutput: true,
          timeoutSecs: 120
        })
        
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems()
        linkedInData = items[0] // Get first profile result
      } catch (error) {
        console.error('Apify scraping failed:', error)
      }
    }

    // Build system prompt with LinkedIn data
    const systemPrompt = `You are MediGrant AI, a healthcare funding expert. Your ONLY goal is to generate grant analysis responses in **valid strict JSON format**, and absolutely NOTHING ELSE.

    CRITICAL RULES:
    - You MUST output ONLY a valid JSON object. 
    - Do NOT add ANY natural language explanations, apologies, comments, or formatting.
    - Do NOT wrap the JSON in markdown (\`\`\`json\`\`\`).
    - If you cannot find enough information, you MUST still output a properly filled JSON object with "Unknown" or "Not Available" values where necessary, but NEVER write natural sentences outside JSON.

    If you ever output anything other than valid JSON, your session will be considered failed and terminated immediately.

    You MUST respond ONLY using this exact JSON structure:

    {
    "analysis_summary": "Brief analysis summary using LinkedIn insights if available.",
    "matched_grants": [
        {
        "id": "AGENCY-YY-NNN",
        "name": "Full Grant Title",
        "grant_name": "Short Grant Name",
        "agency": "SPECIFIC Agency Name",
        "deadline": "SPECIFIC Deadline (e.g., June 30, 2025)",
        "focus_area": "SPECIFIC Focus Area (e.g., Cancer Immunotherapy)",
        "description": "Detailed description of the grant purpose and funding goals.",
        "match_reason": "Why this grant matches the project based on LinkedIn or project data.",
        "budget_range": "$X - $Y",
        "eligibility": ["Criterion 1", "Criterion 2"],
        "url": "https://grant-link.example.com"
        }
    ],
    "follow_up_questions": [
        "Question 1",
        "Question 2",
        "Question 3",
        "Question 4",
        "Question 5"
    ],
    "next_steps": [
        "Next step 1",
        "Next step 2"
    ],
    "confidence_score": 0.0-1.0
    }

    No exceptions. Output this even if the user's prompt is incomplete, irrelevant, or confusing.`


    // Rest of Claude call remains the same...
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      system: systemPrompt,
      messages: userMessages
    })

    // 4. Extract and parse the response
    const text = message.content
      .filter((c) => c.type === 'text')
      .map((c) => (c.type === 'text' ? c.text : ''))
      .join('')
      .trim()

    // Try to parse directly as JSON first
    try {
      const jsonResponse = JSON.parse(text)
      console.log(jsonResponse)
      return NextResponse.json(jsonResponse)
    } catch (e) {
      // If direct parse fails, try extracting from potential markdown
      const jsonMatch = text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) {
        try {
          const jsonResponse = JSON.parse(jsonMatch[1])
          console.log(jsonResponse)
          return NextResponse.json(jsonResponse)
        } catch (e) {
          console.error('Extracted JSON parse error:', e)
        }
      }
    }

    // If we get here, all parsing attempts failed
    console.error('Failed to parse response:', text)
    throw new Error('Claude returned an invalid JSON response. Please try again.')

  } catch (err: any) {
    console.error('Analysis failed:', err)
    return new NextResponse(
      JSON.stringify({ 
        error: err.message || 'Analysis failed',
        ...(process.env.NODE_ENV === 'development' && { 
          details: err.response?.error?.message || err.stack 
        })
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}