import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    // Parse the multipart/form-data request body
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be multipart/form-data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use the Web API to parse the form data
    const formData = await req.formData();
    const file = formData.get('pdf');
    if (!file || !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: 'No PDF uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fileMime = file.type || 'application/pdf';

    // Initialize the Gemini client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    let uploadResult;
    try {
      uploadResult = await ai.files.upload({ file });
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to upload PDF to Gemini' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
    try {
      // Stream the analysis from Gemini
      const stream = await ai.models.generateContentStream({
        model,
        config: configAI,
        contents,
      });
      for await (const chunk of stream) {
        fullText += chunk.text;
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Error from Gemini API' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ text: fullText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}