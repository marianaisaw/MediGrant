/**
 * API service for MediGrant
 * Centralizes all API calls and provides consistent error handling
 */

import { AnalysisResponse } from './types';

/**
 * Analyzes user query with optional LinkedIn URL and PDF data
 */
export async function analyzeQuery(query: string, options?: { linkedInUrl?: string, pdfText?: string, pdfFile?: File }): Promise<AnalysisResponse> {
  try {
    // If we have a PDF file, use multipart/form-data
    if (options?.pdfFile) {
      const formData = new FormData();
      formData.append('query', query);
      formData.append('pdf', options.pdfFile);
      
      if (options.linkedInUrl) {
        formData.append('linkedInUrl', options.linkedInUrl);
      }
      
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API error: ${res.status}`);
      }
      
      return await res.json();
    } 
    // Otherwise use JSON
    else {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }],
          linkedInUrl: options?.linkedInUrl,
          pdfText: options?.pdfText
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API error: ${res.status}`);
      }
      
      return await res.json();
    }
  } catch (error) {
    console.error('Analysis API error:', error);
    throw error;
  }
}

/**
 * Analyzes uploaded PDF file (legacy method - use analyzeQuery with pdfFile option instead)
 * @deprecated Use analyzeQuery with pdfFile option instead
 */
export async function analyzePdf(file: File): Promise<{ text: string }> {
  try {
    const form = new FormData();
    form.append('pdf', file);
    
    const res = await fetch('/api/analyze-pdf', { 
      method: 'POST', 
      body: form 
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to analyze PDF');
    }
    
    return await res.json();
  } catch (error) {
    console.error('PDF Analysis API error:', error);
    throw error;
  }
}
