import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

// Interface for the Grant object we want to return
interface Grant {
  id: string;
  name: string; // Corresponds to agency_name
  grant_name: string; // Corresponds to funding_opportunity_title
  agency: string; // Corresponds to agency_name
  deadline: string; // Corresponds to current_closing_date
  focus_area: string; // Corresponds to category_of_funding_activity
  description: string;
  match_reason: string; // Derived from _score
  budget_range: string; // Derived from award_floor, award_ceiling
  eligibility: string[]; // Corresponds to additional_information_on_eligibility
  url: string; // Corresponds to scraped_url
}

// Interface for the Pinecone response, matching `analyze/route.ts` more closely
interface PineconeSearchApiResponse {
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
        award_floor?: string | number;
        award_ceiling?: string | number;
        additional_information_on_eligibility?: string;
        scraped_url?: string;
        [key: string]: string | number | boolean | string[] | undefined; // For any other fields
      };
    }>;
  };
  usage?: { // Optional usage details
    read_units?: number;
    embed_total_tokens?: number;
  };
  namespace?: string; // Newer SDK might include namespace here
}

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
const pineconeIndexHost = process.env.PINECONE_INDEX_HOST; // From reference, may be optional/deprecated for some index types
const pineconeNamespace = process.env.PINECONE_NAMESPACE || 'grants_description_vector'; // Default to reference, make configurable

if (!pineconeApiKey) {
  console.error('PINECONE_API_KEY environment variable is not set.');
  // In a real app, you might throw an error here or ensure this check is done at server startup
}
if (!pineconeIndexName) {
  console.error('PINECONE_INDEX_NAME environment variable is not set.');
}

const pinecone = new Pinecone({ apiKey: pineconeApiKey! }); // Non-null assertion assuming check or startup validation

function mapPineconeHitsToGrants(pineconeSearchResponse: PineconeSearchApiResponse): Grant[] {
  if (!pineconeSearchResponse.result || !pineconeSearchResponse.result.hits) {
    return [];
  }
  return pineconeSearchResponse.result.hits.map(hit => {
    const fields = hit.fields || {}; // Ensure fields object exists
    const category = fields.category_of_funding_activity;

    const focusArea = typeof category === 'string'
      ? category.split('\n').filter(Boolean).join(', ')
      : Array.isArray(category)
      ? category.join(', ')
      : '';

    const cleanCurrency = (val?: string | number): string => {
        if (val === undefined || val === null) return '';
        return String(val).replace(/\$?\s*|,/g, '').trim(); // Remove $, spaces, and commas
    }

    const floor = cleanCurrency(fields.award_floor);
    const ceiling = cleanCurrency(fields.award_ceiling);
    
    const budgetParts = [floor, ceiling]
        .filter(v => v && !isNaN(Number(v)));
    
    let budget_range = 'Not specified';
    if (budgetParts.length > 0) {
        budget_range = budgetParts.map(v => `$${Number(v).toLocaleString()}`).join(' - ');
    }

    return {
      id: fields.funding_opportunity_number || hit._id,
      name: fields.agency_name || 'Unknown Agency',
      grant_name: fields.funding_opportunity_title || 'Untitled Grant',
      agency: fields.agency_name || 'Unknown Agency',
      deadline: fields.current_closing_date || 'Rolling Deadline',
      focus_area: focusArea,
      description: fields.description || 'No description available',
      match_reason: `Semantic match score: ${hit._score.toFixed(2)}`,
      budget_range: budget_range,
      eligibility: fields.additional_information_on_eligibility
        ? [String(fields.additional_information_on_eligibility)] // Ensure it's an array with the string value
        : [],
      url: fields.scraped_url || '',
    };
  });
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Search query is required and must be a string.' }, { status: 400 });
    }

    if (!pineconeIndexName) { // Check again inside request in case env was not set at module load
        return NextResponse.json({ error: 'Pinecone index name is not configured.' }, { status: 500 });
    }
    if (!pineconeApiKey) { // Check again
        return NextResponse.json({ error: 'Pinecone API key is not configured.' }, { status: 500 });
    }

    // Get the index. The host parameter is included as per the reference.
    // For Pinecone SDK v3+, host is usually not needed for serverless indexes but might be for gRPC.
    const index = pineconeIndexHost 
        ? pinecone.index(pineconeIndexName, pineconeIndexHost)
        : pinecone.index(pineconeIndexName);
    
    const ns = index.namespace(pineconeNamespace);

    // Perform the search using `searchRecords` as in the reference `analyze/route.ts`
    // This method implies Pinecone handles embedding the text query.
    const searchResponse = await ns.searchRecords({
      query: {
        topK: 5, // Fetch top 5 results
        inputs: { text: query }, // Query by text
      },
      fields: ['*'], // Request all metadata fields
    }) as unknown as PineconeSearchApiResponse; // Cast to our defined interface

    const grants = mapPineconeHitsToGrants(searchResponse);

    return NextResponse.json({ grants }, { status: 200 });

  } catch (error) {
    console.error('Pinecone search grants API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to search grants.', details: errorMessage }, { status: 500 });
  }
}
