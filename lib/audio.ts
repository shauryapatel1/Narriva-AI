/**
 * Narriva Audio Utilities
 * 
 * This file contains utilities for handling text-to-speech and audio playback
 * for interactive stories, with support for both ElevenLabs and Web Speech API.
 */

'use client';

import { 
  generateSpeech, 
  isElevenLabsConfigured,
  getVoiceById,
  getVoiceForCharacterType,
  VOICE_ARCHETYPES
} from './elevenlabs';
import { stopAllSoundscapes } from './soundscapes';

// Track current audio elements and state
let currentAudio: HTMLAudioElement | null = null;
let speechSynthesis: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isElevenLabsPlaying = false;
let currentAudioQueue: HTMLAudioElement[] = [];

// Initialize Web Speech API if available
if (typeof window !== 'undefined') {
  speechSynthesis = window.speechSynthesis;
}

// Types for the StoryNode from our story types
interface StoryNode {
  id: string;
  content: string;
  choices?: Array<{ text: string }>;
  metadata?: {
    genre?: string;
    mood?: string;
    setting?: string;
  };
}

// Options for text-to-speech
interface SpeechOptions {
  voiceId?: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onProgress?: (progress: number) => void;
  onError?: (error: any) => void;
  enhancedVoices?: boolean;
  useCharacterVoices?: boolean;
  mood?: string;
}

/**
 * Convert text to speech using ElevenLabs or Web Speech API
 */
export async function textToSpeech(
  text: string,
  options: SpeechOptions = {}
): Promise<void> {
  // Default options
  const {
    voiceId = VOICE_ARCHETYPES.narrator,
    rate = 1,
    volume = 1,
    onStart,
    onEnd,
    onError
  } = options;
  
  try {
    // First try to use ElevenLabs
    if (isElevenLabsConfigured() && options.voiceId) {
      try {
        await useElevenLabs(text, {
          voiceId,
          rate,
          volume,
          onStart,
          onEnd,
          onError
        });
        return;
      } catch (error) {
        console.warn('Error using ElevenLabs, falling back to Web Speech API:', error);
      }
    }
    
    // Fall back to Web Speech API
    await useWebSpeechAPI(text, {
      rate,
      volume,
      onStart,
      onEnd,
      onError
    });
  } catch (error) {
    console.error('Text-to-speech failed:', error);
    onError?.(error);
    throw error;
  }
}

/**
 * Use ElevenLabs for speech synthesis
 */
async function useElevenLabs(
  text: string, 
  options: SpeechOptions
): Promise<void> {
  const {
    voiceId = VOICE_ARCHETYPES.narrator,
    rate = 1,
    volume = 1,
    onStart,
    onEnd,
    onError
  } = options;
  
  try {
    // Generate speech with ElevenLabs
    const audioData = await generateSpeech(text, {
      voiceId,
      stability: 0.5,
      similarityBoost: 0.75
    });
    
    // Create audio from the response
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    
    // Create and configure audio element
    currentAudio = new Audio(url);
    currentAudio.volume = volume;
    
    // Apply playback rate (within limits - ElevenLabs doesn't support as wide a range as Web Speech API)
    // We'll simulate rate changes by adjusting the playbackRate of the audio element
    currentAudio.playbackRate = Math.max(0.5, Math.min(2, rate));
    
    // Set up event handlers
    currentAudio.onplay = () => {
      isElevenLabsPlaying = true;
      onStart?.();
    };
    
    currentAudio.onended = () => {
      isElevenLabsPlaying = false;
      URL.revokeObjectURL(url); // Clean up
      onEnd?.();
    };
    
    currentAudio.onerror = (error) => {
      isElevenLabsPlaying = false;
      URL.revokeObjectURL(url); // Clean up
      onError?.(error);
    };
    
    // Play the audio
    await currentAudio.play();
    
  } catch (error) {
    console.error('Error using ElevenLabs:', error);
    onError?.(error);
    throw error;
  }
}

/**
 * Use browser's Web Speech API for speech synthesis
 */
async function useWebSpeechAPI(
  text: string, 
  options: SpeechOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!speechSynthesis) {
      const error = new Error('Speech synthesis not supported');
      console.error(error);
      options.onError?.(error);
      reject(error);
      return;
    }
    
    // Clear any existing speech synthesis first to prevent conflicts
    speechSynthesis.cancel();
    
    // Make sure speechSynthesis is not in a paused state
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
    
    // Wait a moment for speechSynthesis to reset
    setTimeout(() => {
      try {
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        currentUtterance = utterance;
        
        // Configure options
        const {
          voice,
          rate = 1,
          pitch = 1,
          volume = 1,
          onStart,
          onEnd,
          onPause,
          onResume,
          onError
        } = options;
        
        // Set voice if provided, otherwise use default
        if (voice) {
          const voices = speechSynthesis.getVoices();
          const selectedVoice = voices.find(v => v.name === voice || v.voiceURI === voice);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }
        
        // Set other parameters
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
        
        // Set up event handlers
        utterance.onstart = () => {
          onStart?.();
        };
        
        utterance.onend = () => {
          onEnd?.();
          resolve();
        };
        
        utterance.onerror = (event) => {
          // If the error is 'canceled', we triggered it ourselves for cleanup
          // so we don't need to report it as an actual error
          if (event.error === 'canceled') {
            console.log('Speech was canceled as part of cleanup');
            onEnd?.(); // Still trigger end callback for proper state management
            resolve();
            return;
          }
          
          console.error('Speech synthesis error:', event);
          onError?.(event);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };
        
        utterance.onpause = () => {
          onPause?.();
        };
        
        utterance.onresume = () => {
          onResume?.();
        };
        
        // Speak the utterance
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error initializing speech synthesis:', error);
        options.onError?.(error);
        reject(error);
      }
    }, 100); // Small delay to ensure clean state
  });
}

/**
 * Pause current speech
 */
export function pauseSpeech(): void {
  if (isElevenLabsPlaying && currentAudio) {
    currentAudio.pause();
  } else if (speechSynthesis && speechSynthesis.speaking) {
    speechSynthesis.pause();
  }
}

/**
 * Resume current speech
 */
export function resumeSpeech(): void {
  if (isElevenLabsPlaying && currentAudio) {
    currentAudio.play();
  } else if (speechSynthesis && speechSynthesis.paused) {
    speechSynthesis.resume();
  }
}

/**
 * Cancel any ongoing speech
 */
export function cancelSpeech(): void {
  // If using ElevenLabs, stop the current audio
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    } catch (error) {
      console.error('Error stopping current audio:', error);
    }
  }
  
  // If using Web Speech API, cancel the current utterance
  if (speechSynthesis) {
    try {
      speechSynthesis.cancel();
      currentUtterance = null;
    } catch (error) {
      console.error('Error canceling speech synthesis:', error);
    }
  }
  
  // Reset isPlaying state
  isElevenLabsPlaying = false;
}

/**
 * Stop all audio (speech and soundscapes)
 */
export function stopAllAudio(): void {
  stopCurrentSpeech();
  stopAllSoundscapes();
}

/**
 * Stop current speech playback
 */
function stopCurrentSpeech(): void {
  // Stop ElevenLabs audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
    isElevenLabsPlaying = false;
  }
  
  // Clear audio queue
  currentAudioQueue.forEach(audio => {
    audio.pause();
    audio.src = '';
  });
  currentAudioQueue = [];
  
  // Stop Web Speech API if active
  if (speechSynthesis) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Check if speech is currently playing
 */
export function isSpeaking(): boolean {
  return isElevenLabsPlaying || 
    (speechSynthesis ? speechSynthesis.speaking : false);
}

/**
 * Check if speech is currently paused
 */
export function isPaused(): boolean {
  if (isElevenLabsPlaying && currentAudio) {
    return currentAudio.paused;
  }
  return speechSynthesis ? speechSynthesis.paused : false;
}

/**
 * Get available voices for Web Speech API
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!speechSynthesis) return [];
  return speechSynthesis.getVoices();
}

/**
 * Split text into smaller chunks to avoid issues with long texts
 */
function splitTextForSpeech(text: string, maxLength: number = 1000): string[] {
  if (text.length <= maxLength) {
    return [text];
  }
  
  const chunks: string[] = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    let endIndex = Math.min(startIndex + maxLength, text.length);
    
    // Try to find a sentence break
    if (endIndex < text.length) {
      const sentenceBreaks = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
      let breakFound = false;
      
      for (const sentenceBreak of sentenceBreaks) {
        const breakIndex = text.lastIndexOf(sentenceBreak, endIndex);
        if (breakIndex > startIndex && breakIndex < endIndex) {
          endIndex = breakIndex + sentenceBreak.length;
          breakFound = true;
          break;
        }
      }
      
      // If no sentence break found, try to find a space
      if (!breakFound) {
        const lastSpace = text.lastIndexOf(' ', endIndex);
        if (lastSpace > startIndex) {
          endIndex = lastSpace + 1;
        }
      }
    }
    
    chunks.push(text.substring(startIndex, endIndex));
    startIndex = endIndex;
  }
  
  return chunks;
}

/**
 * Extract character speech from content with improved detection
 */
export function extractCharacterSpeech(content: string): Array<{speaker: string | null, text: string}> {
  const result: Array<{speaker: string | null, text: string}> = [];
  let currentText = '';
  
  // Split by paragraphs for better context
  const paragraphs = content.split(/\n+/);
  
  paragraphs.forEach(paragraph => {
    // Look for dialogue patterns: "Speaker: dialogue" or "Speaker said, "dialogue""
    const dialoguePatterns = [
      // Direct speech format: Character: "Text"
      /([A-Z][a-zA-Z\s]+):\s*["'](.+?)["']/g,
      // Direct speech format: Character: Text
      /([A-Z][a-zA-Z\s]+):\s*(.+)/g,
      // Quote attribution: "Text," said Character
      /["'](.+?)["']\s*(said|whispered|shouted|exclaimed|muttered|asked|replied|inquired|stammered|growled|hissed|yelled|murmured|sighed|answered|remarked|responded)\s+([A-Z][a-zA-Z\s]+)/g,
      // Basic quotes: "Text"
      /["'](.+?)["']/g
    ];
    
    let foundDialogue = false;
    
    // Try each pattern in order of specificity
    for (const pattern of dialoguePatterns) {
      pattern.lastIndex = 0; // Reset regex state
      const matches = [...paragraph.matchAll(pattern)];
      
      if (matches.length > 0) {
        foundDialogue = true;
        
        // Handle previous non-dialogue text
        if (currentText.trim()) {
          result.push({ speaker: null, text: currentText.trim() });
          currentText = '';
        }
        
        // Process dialogue matches
        matches.forEach(match => {
          if (match[3]) {
            // Format: "Text," said Character
            const dialogue = match[1];
            const speaker = match[3];
            // Use character name as speaker
            result.push({ speaker, text: dialogue });
          } else if (match[1] && match[2]) {
            // Format: Character: "Text" or Character: Text
            const speaker = match[1];
            const dialogue = match[2];
            result.push({ speaker, text: dialogue });
          } else if (match[1]) {
            // Just dialogue with no clear speaker
            const dialogue = match[1];
            // Try to guess speaker from context in surrounding text
            const possibleSpeaker = guessSpeakerFromContext(paragraph, dialogue);
            result.push({ speaker: possibleSpeaker, text: dialogue });
          }
        });
        
        break; // Stop after first successful pattern
      }
    }
    
    // If no dialogue pattern matched, add as narrator text
    if (!foundDialogue) {
      currentText += paragraph + '\n';
    }
  });
  
  // Add any remaining text
  if (currentText.trim()) {
    result.push({ speaker: null, text: currentText.trim() });
  }
  
  return result;
}

/**
 * Attempt to guess speaker from context in surrounding text
 */
function guessSpeakerFromContext(paragraph: string, dialogue: string): string | null {
  // Common patterns where a speaker might be identified
  const beforePatterns = [
    // "Speaker says/said before the quote"
    /([A-Z][a-zA-Z\s]+)\s+(says|said|whispered|shouted|exclaimed|muttered|asked|replied|inquired|stammered|growled|hissed|yelled|murmured)/i,
  ];
  
  const afterPatterns = [
    // "after the quote, Speaker says/said" 
    /(says|said|whispered|shouted|exclaimed|muttered|asked|replied|inquired|stammered|growled|hissed|yelled|murmured)\s+([A-Z][a-zA-Z\s]+)/i
  ];
  
  // Check context before dialogue
  const dialoguePos = paragraph.indexOf(dialogue);
  if (dialoguePos > 0) {
    const textBefore = paragraph.substring(0, dialoguePos);
    for (const pattern of beforePatterns) {
      const match = textBefore.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }
  
  // Check context after dialogue
  if (dialoguePos >= 0 && dialoguePos + dialogue.length < paragraph.length) {
    const textAfter = paragraph.substring(dialoguePos + dialogue.length);
    for (const pattern of afterPatterns) {
      const match = textAfter.match(pattern);
      if (match && match[2]) {
        return match[2].trim();
      }
    }
  }
  
  return null;
}

/**
 * Read a story node aloud
 */
export async function readStoryNode(
  node: StoryNode,
  options: SpeechOptions = {}
): Promise<void> {
  if (!node || !node.content) {
    return;
  }
  
  // Cancel any existing speech
  cancelSpeech();
  
  // Default options
  const {
    voiceId = VOICE_ARCHETYPES.narrator,
    rate = 1,
    volume = 1,
    onProgress,
    onStart,
    onEnd,
    onError,
    useCharacterVoices = true
  } = options;
  
  try {
    // Check if Web Speech API is available as a fallback
    const webSpeechAvailable = typeof window !== 'undefined' && 
                              window.speechSynthesis && 
                              window.SpeechSynthesisUtterance;
    
    if (!isElevenLabsConfigured() && !webSpeechAvailable) {
      throw new Error('No speech synthesis methods available');
    }
    
    // Call onStart callback before we start processing
    onStart?.();
    
    // Split content if using character voices, otherwise use paragraphs
    let speechSegments: Array<{ text: string, voiceId?: string }> = [];
    
    if (useCharacterVoices) {
      // Extract character dialogue and assign appropriate voices
      const characterSpeeches = extractCharacterSpeech(node.content);
      
      speechSegments = characterSpeeches.map(segment => {
        if (!segment.speaker) {
          // Narrator text
          return { text: segment.text, voiceId };
        } else {
          // Character dialogue
          // Detect character type and gender from the speaker name
          const speakerLower = segment.speaker.toLowerCase();
          let characterVoiceId = determineCharacterVoice(speakerLower);
          return { text: segment.text, voiceId: characterVoiceId };
        }
      });
    } else {
      // Just split by paragraphs and use narrator voice for all
      const paragraphs = node.content
        .split('\n\n')
        .filter(p => p.trim().length > 0);
        
      speechSegments = paragraphs.map(p => ({ text: p, voiceId }));
    }
    
    // Read each segment in sequence
    let currentSegmentIndex = 0;
    let overallProgress = 0;
    
    for (const segment of speechSegments) {
      try {
        // Skip empty segments
        if (!segment.text.trim()) {
          currentSegmentIndex++;
          continue;
        }
        
        // Try to use ElevenLabs first if configured
        let usedElevenLabs = false;
        
        if (isElevenLabsConfigured()) {
          try {
            await textToSpeech(segment.text, {
              voiceId: segment.voiceId,
              rate,
              volume,
              onEnd: () => {
                // Segment ended
                currentSegmentIndex++;
                overallProgress = currentSegmentIndex / speechSegments.length;
                onProgress?.(overallProgress);
              },
              onError: (error) => {
                console.warn('ElevenLabs error, falling back to Web Speech API:', error);
                throw error; // Force fallback
              }
            });
            
            usedElevenLabs = true;
            // Continue to next segment if successful
            continue;
          } catch (error) {
            console.warn('Falling back to Web Speech API');
            // Fall through to Web Speech API
          }
        }
        
        // Only use Web Speech API if ElevenLabs didn't work
        if (!usedElevenLabs && webSpeechAvailable) {
          // For Web Speech API, keep segments shorter to reduce errors
          const segmentChunks = splitTextForSpeech(segment.text, 200);
          
          for (const chunk of segmentChunks) {
            await useWebSpeechAPI(chunk, {
              rate,
              volume,
              onEnd: () => {
                // If this is the last chunk of the segment, update progress
                if (chunk === segmentChunks[segmentChunks.length - 1]) {
                  currentSegmentIndex++;
                  overallProgress = currentSegmentIndex / speechSegments.length;
                  onProgress?.(overallProgress);
                }
              }
            });
            
            // Small pause between chunks
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } else if (!usedElevenLabs) {
          throw new Error('No speech synthesis methods available');
        }
        
        // Small pause between segments
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error('Error reading segment:', error);
        // Don't stop completely - just update progress and continue
        currentSegmentIndex++;
        overallProgress = currentSegmentIndex / speechSegments.length;
        onProgress?.(overallProgress);
        
        // Small pause before trying next segment
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    // All segments complete
    onEnd?.();
    
  } catch (error) {
    console.error('Error in readStoryNode:', error);
    // Make sure we call onError to notify caller about the issue
    onError?.(error);
  }
}

// Helper function to determine character voice from speaker attributes
function determineCharacterVoice(speakerLower: string): string {
  // Female characters
  if (
    speakerLower.includes('woman') || 
    speakerLower.includes('girl') || 
    speakerLower.includes('lady') || 
    speakerLower.includes('mrs') || 
    speakerLower.includes('ms') || 
    speakerLower.includes('miss') ||
    speakerLower.includes('mother') ||
    speakerLower.includes('sister') ||
    speakerLower.includes('aunt') ||
    speakerLower.includes('queen') ||
    speakerLower.includes('princess')
  ) {
    // Young female
    if (
      speakerLower.includes('young') || 
      speakerLower.includes('girl') || 
      speakerLower.includes('child') ||
      speakerLower.includes('daughter')
    ) {
      return VOICE_ARCHETYPES.youngFemale;
    }
    
    // Elderly female
    if (
      speakerLower.includes('old') || 
      speakerLower.includes('elder') || 
      speakerLower.includes('ancient') ||
      speakerLower.includes('grandmother') ||
      speakerLower.includes('granny')
    ) {
      return VOICE_ARCHETYPES.elderlyFemale;
    }
    
    // Default adult female
    return VOICE_ARCHETYPES.adultFemale;
  }
  
  // Male characters
  if (
    speakerLower.includes('man') || 
    speakerLower.includes('boy') || 
    speakerLower.includes('sir') || 
    speakerLower.includes('mr') || 
    speakerLower.includes('father') ||
    speakerLower.includes('brother') ||
    speakerLower.includes('uncle') ||
    speakerLower.includes('king') ||
    speakerLower.includes('prince')
  ) {
    // Young male
    if (
      speakerLower.includes('young') || 
      speakerLower.includes('boy') || 
      speakerLower.includes('child') ||
      speakerLower.includes('son')
    ) {
      return VOICE_ARCHETYPES.youngMale;
    }
    
    // Elderly male
    if (
      speakerLower.includes('old') || 
      speakerLower.includes('elder') || 
      speakerLower.includes('ancient') ||
      speakerLower.includes('grandfather') ||
      speakerLower.includes('grandpa')
    ) {
      return VOICE_ARCHETYPES.elderlyMale;
    }
    
    // Default adult male
    return VOICE_ARCHETYPES.adultMale;
  }
  
  // Mythical or magical characters
  if (
    speakerLower.includes('wizard') || 
    speakerLower.includes('witch') || 
    speakerLower.includes('fairy') ||
    speakerLower.includes('elf') ||
    speakerLower.includes('dwarf') ||
    speakerLower.includes('spirit') ||
    speakerLower.includes('ghost') ||
    speakerLower.includes('magic')
  ) {
    return VOICE_ARCHETYPES.mystical;
  }
  
  // Monster or creature
  if (
    speakerLower.includes('monster') || 
    speakerLower.includes('creature') || 
    speakerLower.includes('beast') ||
    speakerLower.includes('dragon') ||
    speakerLower.includes('troll') ||
    speakerLower.includes('goblin') ||
    speakerLower.includes('orc')
  ) {
    return VOICE_ARCHETYPES.monster;
  }
  
  // Default to narrator if we can't determine
  return VOICE_ARCHETYPES.narrator;
}

// Update audio volume for current playback
export function setAudioVolume(volume: number): void {
  // Clamp volume between 0 and 1
  const safeVolume = Math.max(0, Math.min(1, volume));
  
  // If using ElevenLabs, set volume of current audio
  if (currentAudio) {
    try {
      currentAudio.volume = safeVolume;
    } catch (error) {
      console.error('Error setting audio volume:', error);
    }
  }
  
  // If using Web Speech API with an active utterance
  // Note: Cannot change volume of an utterance after it has started,
  // but this will affect the next utterance
  if (currentUtterance) {
    try {
      currentUtterance.volume = safeVolume;
    } catch (error) {
      console.error('Error setting utterance volume:', error);
    }
  }
} 