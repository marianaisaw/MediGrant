import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { ApifyClient } from 'apify-client'
import { Pinecone } from '@pinecone-database/pinecone'

interface UserMessage {
  role: string
  content: string
}

interface LinkedInData {
  [key: string]: unknown
}

interface Grant {
  id: string
  name: string
  grant_name: string
  agency: string
  deadline: string
  focus_area: string
  description: string
  match_reason: string
  budget_range: string
  eligibility: string[]
  url: string
}

interface ClaudeResponse {
  analysis_summary: string
  matched_grants: Grant[]
  follow_up_questions: string[]
  next_steps: string[]
  confidence_score: number
}

interface PineconeResponse {
  result: {
    hits: Array<{
      _id: string;
      _score: number;
      fields: {
        funding_opportunity_number?: string;
        agency_name?: string;
        funding_opportunity_title?: string;
        current_closing_date?: string;
        category_of_funding_activity?: string | string[];
        description?: string;
        award_floor?: string;
        award_ceiling?: string;
        additional_information_on_eligibility?: string;
        scraped_url?: string;
        [key: string]: string | number | boolean | string[] | undefined;
      };
    }>;
  };
  usage: {
    read_units: number;
    embed_total_tokens: number;
  };
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN })
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })


// Process PDF file and extract text using Gemini
async function processPdf(file: Blob): Promise<string> {
  try {
    const fileMime = file.type || 'application/pdf';
    
    // Initialize the Gemini client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    // Upload the file to Gemini
    const uploadResult = await ai.files.upload({ file });
    
    const model = 'gemini-2.0-flash';
    const configAI = { responseMimeType: 'text/plain' };

    // Build the contents array, first part is the file, then the parse command
    const contents = [
      {
        role: 'user',
        parts: [
          {
            fileData: {
              fileUri: uploadResult.uri,
              mimeType: fileMime,
            },
          },
          { text: 'parse' },
        ],
      },
    ];

    let fullText = '';
    // Stream the analysis from Gemini
    const stream = await ai.models.generateContentStream({
      model,
      config: configAI,
      contents,
    });
    
    for await (const chunk of stream) {
      fullText += chunk.text;
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('Failed to process PDF');
  }
}

function mapPineconeResponse(response: PineconeResponse): Grant[] {
  return response.result.hits.map(hit => {
    const fields = hit.fields;
    const category = fields.category_of_funding_activity;
    
    // Handle different format variants for funding categories
    const focusArea = typeof category === 'string' 
      ? category.split('\n').filter(Boolean).join(', ')
      : Array.isArray(category)
      ? category.join(', ')
      : '';

    // Clean budget values
    const cleanCurrency = (val?: string) => 
      val ? val.replace(/\$?\s*/g, '').trim() : '';
      
    const floor = cleanCurrency(fields.award_floor);
    const ceiling = cleanCurrency(fields.award_ceiling);
    
    return {
      id: fields.funding_opportunity_number || hit._id,
      name: fields.agency_name || 'Unknown Agency',
      grant_name: fields.funding_opportunity_title || 'Untitled Grant',
      agency: fields.agency_name || 'Unknown Agency',
      deadline: fields.current_closing_date || 'Rolling Deadline',
      focus_area: focusArea,
      description: fields.description || 'No description available',
      match_reason: `Semantic match score: ${hit._score.toFixed(2)}`,
      budget_range: [floor, ceiling]
        .filter(v => v && !isNaN(Number(v)))
        .map(v => `$${v}`)
        .join(' - ') || 'Not specified',
      eligibility: fields.additional_information_on_eligibility
        ? [fields.additional_information_on_eligibility]
        : [],
      url: fields.scraped_url || ''
    };
  });
}

async function searchPineconeGrants(queryText: string): Promise<Grant[]> {
  try {
    const index = pinecone.index(
      process.env.PINECONE_INDEX_NAME!,
      process.env.PINECONE_INDEX_HOST!
    );
    
    const namespace = index.namespace('grants_description_vector');
    const response = await namespace.searchRecords({
      query: {
        topK: 3,
        inputs: { text: queryText },
      },
      fields: ['*'],
    }) as unknown as PineconeResponse;

    return mapPineconeResponse(response);
  } catch (error) {
    console.error('Pinecone search error:', error);
    return [];
  }
}


export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let userMessages: UserMessage[] = [];
    let linkedInUrl: string | undefined;
    let pdfText: string | null = null;

    console.log(userMessages)
    
    if (contentType.startsWith('multipart/form-data')) {
      const formData = await req.formData();
      
      const queryData = formData.get('query');
      if (queryData && typeof queryData === 'string') {
        userMessages = [{ role: 'user', content: queryData }];
      }
      
      const linkedInData = formData.get('linkedInUrl');
      if (linkedInData && typeof linkedInData === 'string') {
        linkedInUrl = linkedInData;
      }
      
      const pdfFile = formData.get('pdf');
      if (pdfFile && pdfFile instanceof Blob) {
        try {
          pdfText = await processPdf(pdfFile);
        } catch (pdfError) {
          console.error('PDF processing error:', pdfError);
        }
      }
    } 
    else {
      const body = await req.json();
      userMessages = body.messages as UserMessage[];
      linkedInUrl = body.linkedInUrl as string | undefined;
      pdfText = body.pdfText as string | null;
    }

    let linkedInData: LinkedInData | null = null
    if (linkedInUrl) {
      try {
        const run = await apifyClient.actor('2SyF0bVxmgGr8IVCZ').call({
          profileUrls: [linkedInUrl],
          extendOutput: true,
          timeoutSecs: 120,
        })
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems()
        linkedInData = (items[0] as LinkedInData) || null
      } catch (error) {
        console.error('Error fetching LinkedIn data:', error)
      }
    }
    

    const lastUserMessage = userMessages[userMessages.length - 1]?.content || ''
    
    // Search Pinecone using built-in embeddings
    const matchedGrants = await searchPineconeGrants(lastUserMessage)

    // Build enhanced prompt with Pinecone results
    const systemPrompt = `You are MediGrant AI analyzing funding opportunities. Use this data:
    
    Matched Grants (${matchedGrants.length}):
    ${matchedGrants.slice(0, 3).map(g => `
    - ${g.grant_name} by ${g.agency}
      Focus: ${g.focus_area}
      Deadline: ${g.deadline}
      Budget: ${g.budget_range}
      Eligibility: ${g.eligibility.join(', ')}`).join('\n')}

    LinkedIn Data: ${linkedInData ? JSON.stringify(linkedInData) : 'None'}
    PDF Excerpt: ${pdfText?.substring(0, 2000) || 'None'}

    Generate JSON response with:
    - analysis_summary: 2-3 paragraph analysis
    - follow_up_questions: 3 relevant questions
    - next_steps: 3 concrete steps
    - confidence_score: 0-1 based on match quality`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: systemPrompt,
    })

    try {
      const analysis = JSON.parse(response.text ?? '')

      const finalResponse: ClaudeResponse = {
        ...analysis,
        matched_grants: matchedGrants
      }

      return NextResponse.json(finalResponse)
    } catch {
      const match = response.text?.match(/(\{[\s\S]*\})/)
      if (match) {
        const jsonResponse: ClaudeResponse = JSON.parse(match[1])
        const finalResponse: ClaudeResponse = {
          ...jsonResponse,
          matched_grants: matchedGrants
        }
        return NextResponse.json(finalResponse)
      }
    }

    throw new Error('Gemini returned an invalid JSON response.')
  } catch (err: unknown) {
    const error = err as Error
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Analysis failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
