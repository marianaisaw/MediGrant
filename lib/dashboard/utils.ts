import { AnalysisResponse, Message } from './types'

export const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`

export const formatClaudeResponse = (data: AnalysisResponse) => {
  if (!data) {
    return {
      text: "⚠️ No analysis data was returned. Please try again.",
      followUpQuestions: ["Would you like to retry your query?"]
    }
  }

  // ---------- summary ----------
  let text =
    `✅ Analysis Complete\n\n` +
    `${data.analysis_summary || 'No summary available.'}\n\n`

  // ---------- grants ----------
  if (data.matched_grants?.length) {
    data.matched_grants.forEach((g, i) => {
      // Accept either a Grant object or a plain string
      const grant = typeof g === 'string'
        ? { id: `GRANT-${i+1}`, name: g, agency: '—', deadline: '—', focus_area: '—', match_reason: '' }
        : g

      text +=
        `\n${i + 1}. ${grant.id} - ${grant.name}\n` +
        `   • Agency: ${grant.agency}\n` +
        `   • Deadline: ${grant.deadline}\n` +
        `   • Focus: ${grant.focus_area}\n` +
        (grant.match_reason ? `   › ${grant.match_reason}\n` : '')
    })
  }

  // ---------- next steps ----------
  if (data.next_steps?.length) {
    text += `\nNext Steps:\n${data.next_steps.map(s => `• ${s}`).join('\n')}`
  }

  // Return the main text and the array of follow-up questions separately.
  // The main 'text' should NOT include the follow-up questions text if they are to be buttons.
  return { text, followUpQuestions: data.follow_up_questions }
}

// Optimized typeMessage with batched rendering for better performance
export const typeMessage = async (message: string, existingMessages: Message[], messageId: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>, emitParticles: (count: number) => void) => {
  // Add typing indicator immediately
  const initialTimestamp = new Date();
  setMessages([...existingMessages, {
    id: messageId,
    content: '',
    sender: 'bot',
    status: 'typing',
    timestamp: initialTimestamp
  }])
  
  // Batch sizes for better performance - chunk the text instead of character by character
  const chunkSize = 10;
  const chunks = [];
  
  // Split message into chunks for more efficient rendering
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.substring(i, i + chunkSize));
  }
  
  let typedContent = '';
  for (let i = 0; i < chunks.length; i++) {
    typedContent += chunks[i];
    
    setMessages(prev => {
      const prevWithoutTyping = prev.filter(m => m.id !== messageId || m.status !== 'typing');
      const originalMessage = prev.find(m => m.id === messageId);
      return [...prevWithoutTyping, {
        id: messageId,
        content: typedContent,
        sender: 'bot',
        status: i === chunks.length - 1 ? 'complete' : 'typing',
        timestamp: originalMessage?.timestamp || initialTimestamp
      }];
    });
    
    // Emit particles only when a grant ID is found in the new chunk (max once per chunk)
    if (chunks[i].match(/[A-Z]{2,}-\d{2}-\d{3}/)) {
      emitParticles(3); 
    }
    
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}
