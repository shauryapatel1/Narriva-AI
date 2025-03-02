// Story Types

export interface Character {
  id: string;
  name: string;
  description?: string;
  traits?: string[];
  type?: string;
  gender?: string;
  age?: number;
  role?: 'protagonist' | 'antagonist' | 'supporting';
  voiceId?: string;
}

export interface StoryChoice {
  text: string;
  nextNode?: string;
  effects?: {
    addItem?: string;
    removeItem?: string;
    changeStats?: Record<string, number>;
    unlockLocation?: string;
    changeMood?: string;
  };
}

export interface StoryNode {
  id: string;
  content: string;
  choices?: StoryChoice[];
  metadata?: {
    genre?: string;
    mood?: string;
    setting?: string;
    timeOfDay?: string;
    weather?: string;
    characterFocus?: string;
  };
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  genre?: string;
  setting?: string;
  mood?: string;
  protagonist?: Character;
  characters?: Character[];
  nodes: Record<string, StoryNode>;
  startNodeId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId?: string;
  isPublished?: boolean;
  viewCount?: number;
  rating?: number;
  tags?: string[];
}

export interface UserProgress {
  storyId: string;
  currentNodeId: string;
  visitedNodes: string[];
  inventory?: string[];
  stats?: Record<string, number>;
  lastRead: Date | string;
}

/**
 * Extract the likely genre from story content
 */
export function extractGenre(content: string): string {
  const content_lower = content.toLowerCase();
  
  if (content_lower.includes('dragon') || 
      content_lower.includes('magic') || 
      content_lower.includes('sword') ||
      content_lower.includes('kingdom')) {
    return 'fantasy';
  } else if (content_lower.includes('spaceship') || 
             content_lower.includes('alien') || 
             content_lower.includes('planet') ||
             content_lower.includes('galaxy')) {
    return 'sci-fi';
  } else if (content_lower.includes('ghost') || 
             content_lower.includes('haunt') || 
             content_lower.includes('scary') ||
             content_lower.includes('terrif')) {
    return 'horror';
  } else if (content_lower.includes('gun') || 
             content_lower.includes('detective') || 
             content_lower.includes('crime') ||
             content_lower.includes('mystery')) {
    return 'thriller';
  }
  
  return 'general';
} 