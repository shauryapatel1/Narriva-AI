import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate a story node based on a prompt
export async function generateStoryNode(
  prompt: string,
  previousContent?: string,
  choices?: string[]
) {
  try {
    const systemPrompt = `You are an expert storyteller creating interactive fiction. 
    Create engaging, immersive content with vivid descriptions and compelling characters.
    Each response should be a single story segment (200-300 words) that ends with 2-3 choices for the reader.
    Make the choices meaningful and lead to different narrative paths.`;

    let userPrompt = prompt;
    
    if (previousContent && choices) {
      userPrompt = `
      Previous story segment: ${previousContent}
      
      The reader chose: ${choices[choices.length - 1]}
      
      Continue the story based on this choice. Remember to end with 2-3 new choices.
      `;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Parse the content to extract the story and choices
    const { storyText, choices: extractedChoices } = parseStoryContent(content);
    
    return {
      content: storyText,
      choices: extractedChoices
    };
  } catch (error) {
    console.error('Error generating story node:', error);
    throw error;
  }
}

// Generate a complete story outline based on a prompt
export async function generateStoryOutline(prompt: string, genre: string) {
  try {
    const systemPrompt = `You are an expert storyteller specializing in ${genre} stories.
    Create a compelling outline for an interactive story with multiple branching paths.
    The outline should include:
    1. A captivating introduction that sets the scene
    2. 3-5 key decision points that branch the narrative
    3. 2-3 possible endings
    4. Main characters and their motivations
    5. Key themes and mood`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating story outline:', error);
    throw error;
  }
}

// Helper function to parse story content and extract choices
function parseStoryContent(content: string) {
  // Split the content by newlines to find choices
  const lines = content.split('\n');
  
  // Find where choices begin (usually after a blank line)
  let choiceStartIndex = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '' && i < lines.length - 1) {
      choiceStartIndex = i + 1;
      break;
    }
  }
  
  // Extract choices (usually numbered or bulleted)
  const choiceLines = lines.slice(choiceStartIndex);
  const choices: string[] = [];
  
  for (const line of choiceLines) {
    // Remove numbers, bullets, etc. at the beginning of the line
    const trimmedLine = line.trim().replace(/^[0-9\-\*\•\.]+\s*/, '');
    if (trimmedLine && !trimmedLine.startsWith('Choice')) {
      choices.push(trimmedLine);
    }
  }
  
  // Extract the story text (everything before the choices)
  const storyText = lines.slice(0, choiceStartIndex).join('\n').trim();
  
  return { storyText, choices };
} 