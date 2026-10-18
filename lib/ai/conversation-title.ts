export function generateConversationTitle(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return 'New Conversation';
  const clean = prompt.trim().replace(/\s+/g, ' ');
  const lower = clean.toLowerCase();

  // Strip common conversational filler
  const stripped = lower.replace(/^(?:can you\s+|could you\s+|please\s+|i want to\s+|i need to\s+|help me\s+)/i, '');

  // 1. Job matching
  if (stripped.match(/^(?:find|search|match|show)\s+(?:me\s+)?(?:matching\s+)?jobs/i) || lower.includes('jobs that match')) {
    return 'Job Matches';
  }
  const roleJobMatch = clean.match(/(?:find|search|show)\s+(?:me\s+)?([a-z0-9\s]+?)\s+jobs/i);
  if (roleJobMatch && roleJobMatch[1]) {
    const role = roleJobMatch[1].replace(/^(?:matching|relevant|all)\s+/i, '').trim();
    if (role && role.length < 25) return `${capitalizeWords(role)} Jobs`;
  }

  // 2. Resume tailoring
  const resumeMatch = clean.match(/(?:improve|optimize|tailor|update|review|check|fix)\s+(?:my\s+)?resume(?:\s+for\s+(?:a\s+|an\s+)?([^.?!,\n]+))?/i);
  if (resumeMatch) {
    if (resumeMatch[1] && resumeMatch[1].trim()) {
      let role = resumeMatch[1].trim().replace(/\s+(?:role|position|job)$/i, '').slice(0, 24);
      return `${capitalizeWords(role)} Resume`;
    }
    return 'Resume Optimization';
  }

  // 3. Interview prep
  const interviewMatch = clean.match(/(?:prepare|prep|practice|mock)\s+(?:me\s+)?(?:for\s+(?:an?\s+)?)?interview(?:\s+(?:at|for|with)\s+([^.?!,\n]+))?/i);
  if (interviewMatch) {
    if (interviewMatch[1] && interviewMatch[1].trim()) {
      const company = interviewMatch[1].trim().slice(0, 20);
      return `${capitalizeWords(company)} Interview Prep`;
    }
    return 'Interview Prep';
  }

  // 4. Skills missing
  if (lower.includes('missing') && (lower.includes('skill') || lower.includes('gap'))) {
    return 'Skills Gap Analysis';
  }

  // 5. Coding practice
  if (lower.match(/(?:practice|solve|give me|challenge)\s+coding/i) || lower.includes('coding challenge')) {
    return 'Coding Practice';
  }

  // 6. Explain concept
  const explainMatch = clean.match(/^(?:explain|what is|how does)\s+([^.?!,\n]+)/i);
  if (explainMatch && explainMatch[1]) {
    return capitalizeWords(explainMatch[1].trim().slice(0, 28));
  }

  // 7. Learning roadmap
  const learnMatch = clean.match(/(?:learning\s+plan|roadmap|learn)\s+(?:for\s+)?([^.?!,\n]+)/i);
  if (learnMatch && learnMatch[1]) {
    return `${capitalizeWords(learnMatch[1].trim().slice(0, 22))} Roadmap`;
  }

  // Fallback: concise first words
  const words = clean.split(' ').slice(0, 5).join(' ');
  return words.length > 32 ? `${capitalizeWords(words.slice(0, 30).trim())}...` : capitalizeWords(words);
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}
