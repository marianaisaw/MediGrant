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
    const systemPrompt = `You are MediGrant AI, a healthcare funding expert. Analyze research projects and match with grants. Follow these steps:

    1. ${linkedInData ? `Analyze LinkedIn Profile:
       - Name: ${linkedInData.fullName}
       - Current: ${linkedInData.position} at ${linkedInData.company}
       - Experience: ${linkedInData.experience && Array.isArray(linkedInData.experience) ? linkedInData.experience.slice(0,3).map((e: { title: string, company: string }) => `${e.title} at ${e.company}`).join(', ') : 'No experience data'}
       - Education: ${linkedInData.education && Array.isArray(linkedInData.education) ? linkedInData.education.map((e: { degree: string, school: string }) => `${e.degree} at ${e.school}`).join(', ') : 'No education data'}
       - Skills: ${linkedInData.skills && Array.isArray(linkedInData.skills) ? linkedInData.skills.join(', ') : 'No skills data'}` 
       : 'No LinkedIn profile provided'}
    
    2. Match project description to grants considering:
       - User's institutional affiliations
       - Technical expertise from skills
       - Career stage based on experience
       - Relevant collaborators

    3. For each grant match, you MUST provide detailed information for these fields:
       - agency: Provide the SPECIFIC funding agency name (e.g., "National Institutes of Health", "National Science Foundation", "Bill & Melinda Gates Foundation"). NEVER use generic terms like "Unknown" or "TBD".
       - deadline: Provide a SPECIFIC application deadline with month, day, and year (e.g., "June 30, 2025", "December 15, 2025", "Rolling deadline"). NEVER use generic terms like "Unknown" or "TBD".
       - focus_area: Provide the SPECIFIC research focus or priority area (e.g., "Infectious Disease Prevention", "Cancer Immunotherapy", "Mental Health Technology"). NEVER use generic terms like "Unknown", "Pending", or "TBD".

    4. Generate 3-5 thoughtful follow-up questions that would help refine the grant search or provide more targeted recommendations. These questions should:
       - Address gaps in the user's initial query
       - Help clarify project scope, timeline, or budget needs
       - Explore potential eligibility requirements
       - Inquire about specific research methodologies or approaches
       - Ask about institutional resources or constraints

    CRITICAL INSTRUCTION: YOU MUST RESPOND ONLY WITH VALID JSON. DO NOT include any explanatory text, markdown formatting, code blocks, or other content outside of the JSON object. Your entire response must be parseable as JSON.

    Respond with this exact JSON structure: {
      "analysis_summary": "Include LinkedIn insights if available",
      "matched_grants": [
        {
          "id": "unique-id-string",
          "name": "Full Grant Title",
          "grant_name": "Short Grant Name",
          "agency": "SPECIFIC Agency Name",
          "deadline": "SPECIFIC Deadline Date",
          "focus_area": "SPECIFIC Research Focus",
          "description": "Detailed grant description",
          "match_reason": "Why this grant matches the project",
          "budget_range": "$100,000 - $500,000",
          "eligibility": ["criteria1", "criteria2"],
          "url": "https://grant-website.org"
        }
      ],
      "follow_up_questions": [
        "What is your project's anticipated timeline?",
        "Do you have any specific budget requirements or constraints?",
        "Are you affiliated with a specific research institution?",
        "What previous experience do you have with grant applications?",
        "Are you open to collaborative opportunities with other researchers?"
      ],
      "next_steps": ["Consider LinkedIn connections for collaboration"],
      "confidence_score": 0-1
    }`

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