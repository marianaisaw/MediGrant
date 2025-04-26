import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userMessages = body.messages

    // 1. Validate input
    if (!Array.isArray(userMessages) || userMessages.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: '"messages" field is required and must be a non-empty array.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 2. Enhanced system prompt with strict JSON formatting instructions
    const systemPrompt = `You are MediGrant AI, a healthcare funding expert. Analyze research projects and match with grants from NIH, NSF, and private foundations. 

    IMPORTANT: Your response must be a valid JSON object ONLY, with no additional text or explanations. The JSON must contain these fields:
    {
      "analysis_summary": "string",
      "matched_grants": [
        {
          "id": "string (format: AGENCY-YY-NNN)",
          "name": "string",
          "agency": "string",
          "deadline": "string",
          "focus_area": "string",
          "match_reason": "string"
        }
      ],
      "next_steps": "string[]",
      "follow_up_questions": "string[]",
      "confidence_score": "number (0-1)"
    }

    Respond ONLY with the JSON object, without any markdown formatting or additional text.`

    // 3. Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      temperature: 0.3,
      system: systemPrompt,
      messages: userMessages
    })

    // 4. Extract and parse the response
    const text = message.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('')
      .trim()

    // Try to parse directly as JSON first
    try {
      const jsonResponse = JSON.parse(text)
      return NextResponse.json(jsonResponse)
    } catch (e) {
      // If direct parse fails, try extracting from potential markdown
      const jsonMatch = text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) {
        try {
          const jsonResponse = JSON.parse(jsonMatch[1])
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