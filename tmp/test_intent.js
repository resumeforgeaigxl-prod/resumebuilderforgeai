const detectIntent = (text) => {
  const lower = text.toLowerCase();
  if (lower.match(/\b(learn|understand|what is|explain|how does|why use|concept|theory|tell me about|curriculum|roadmap)\b/)) return 'EXPLANATION';
  if (lower.match(/\b(build|code|implement|create|setup|write|develop|how to code|give me code|snippet|example code)\b/)) return 'CODE';
  if (lower.match(/\b(error|fix|bug|problem|issue|not working|failed|broken|debug|crash|exception|help with)\b/)) return 'DEBUG';
  return 'GENERAL';
};

const tests = [
  "I want to learn RAG",
  "Build a simple express server",
  "Explain RAG",
  "How do I fix this error?",
  "What is a vector database?",
  "Write a python script"
];

tests.forEach(t => {
  console.log(`"${t}" => ${detectIntent(t)}`);
});
