import { generateAIResponse, extractJson } from '../ai-provider';

export interface GeneratedPrepQuestion {
  id?: string;
  type: 'aptitude' | 'reasoning' | 'coding';
  topic: string;
  title: string;
  slug: string;
  problem: string;
  input_output?: string;
  approach: string[];
  code?: string;
  line_explanation?: string[];
  variations: string[];
}

const TCS_PATTERNS = {
  aptitude: [
    'Number System (Divisibility, Remainders)',
    'Arithmetic (Time/Work, Percentages, Proportions)',
    'Geometry & Mensuration',
    'Data Interpretation',
    'Permutations & Combinations'
  ],
  coding: [
    'Number Logic (Armstrong, Palindrome, Strong, Perfect)',
    'Array Manipulation (Sorting, Subarrays, Matrix)',
    'String Algorithms (Hashing, Patterns, Anagrams)'
  ]
};

export async function generatePrepForgeQuestion(
  type: 'aptitude' | 'reasoning' | 'coding',
  topic?: string
): Promise<GeneratedPrepQuestion> {
  const selectedTopic = topic || (type === 'coding' 
    ? TCS_PATTERNS.coding[Math.floor(Math.random() * TCS_PATTERNS.coding.length)]
    : TCS_PATTERNS.aptitude[Math.floor(Math.random() * TCS_PATTERNS.aptitude.length)]);

  const prompt = `
    Generate a HIGH-ACCURACY TCS NQT ${type} question.
    Topic: ${selectedTopic}.
    
    The question must follow real TCS recruitment patterns (basic to intermediate logic).
    
    RESPONSE FORMAT (JSON):
    {
      "type": "${type}",
      "topic": "${selectedTopic}",
      "title": "Concise title for the question",
      "problem": "Detailed problem statement",
      "input_output": "Example Input and Output (mandatory for coding)",
      "approach": ["Step 1...", "Step 2..."],
      "code": "Complete Java Code with NEWLINES and INDENTATION. Use \\n for breaks.",
      "line_explanation": [
        "Explanation for line 1 logic...",
        "Explanation for line 2-3 logic...",
        "..."
      ],
      "variations": ["Variant 1...", "Variant 2..."]
    }
    
    CRITICAL: 
    - Formatting: The "code" string MUST contain literal newline characters (\\n).
    - Mapping: Ensure each entry in "line_explanation" corresponds strictly to the sequential flow of the code.
    - No Redundant Text: Do NOT include "Line 1:", "Point 1:" etc. in the "line_explanation" array. Just the explanation text.
    - If type is aptitude/reasoning, the "code" and "line_explanation" can be formulas or brief, but "approach" must be detailed.
    
    Return ONLY a valid JSON object.
  `;

  const response = await generateAIResponse(
    prompt,
    'openai/gpt-4o-mini',
    "Expert TCS NQT Interviewer. Provide well-formatted Java code with proper line breaks and detailed pedagogical explanations.",
    0.3,
    3000
  );

  const jsonString = extractJson(response.text);
  const q = JSON.parse(jsonString);

  // Post-processing to ensure code isn't just one long string if AI ignored instructions
  if (q.code && !q.code.includes('\n') && q.code.includes('{')) {
      // Basic fallback: if no newlines but has braces, maybe we can add some? 
      // But better to just try getting a better AI response with the prompt above.
  }

  return q as GeneratedPrepQuestion;
}

export async function generateDailyPrepBundle() {
  const bundle: GeneratedPrepQuestion[] = [];
  
  // 5 Aptitude
  for (let i = 0; i < 5; i++) {
    try {
      const q = await generatePrepForgeQuestion('aptitude');
      bundle.push(q);
    } catch (e) { console.error('Daily Apt Gen Error', e); }
  }
  
  // 2 Coding
  for (let i = 0; i < 2; i++) {
    try {
      const q = await generatePrepForgeQuestion('coding');
      bundle.push(q);
    } catch (e) { console.error('Daily Coding Gen Error', e); }
  }
  
  return bundle;
}
