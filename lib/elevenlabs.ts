/**
 * ElevenLabs API integration for high-quality text-to-speech
 */

// Check if running on the server side
const isServer = typeof window === 'undefined';

// Get API key from environment variable
const ELEVENLABS_API_KEY = isServer ? process.env.ELEVENLABS_API_KEY : null;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Voice archetypes for different character types
export const VOICE_ARCHETYPES = {
  narrator: 'joshua', // Default narrator voice
  narratorFemale: 'elli', // Female narrator
  adultMale: 'adam', // Default adult male voice
  adultFemale: 'rachel', // Default adult female voice
  youngMale: 'thomas', // Young male voice
  youngFemale: 'charlie', // Young female voice
  elderlyMale: 'douglas', // Elderly male voice
  elderlyFemale: 'domi', // Elderly female voice
  mystical: 'bella', // Mystical/magical character voice
  monster: 'josh' // Monster/creature voice
};

// Interface for voice data from ElevenLabs
export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  samples?: Array<{ sample_id: string; file_name: string; mime_type: string; size_bytes: number; hash: string }>;
  category?: string;
  fine_tuning?: { is_allowed_to_fine_tune: boolean; fine_tuning_requested: boolean; finetuning_state: string };
  labels?: Record<string, string>;
  description?: string;
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: {
    stability: number;
    similarity_boost: number;
  };
}

// Interface for speech generation options
export interface SpeechOptions {
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  speakerId?: string;
  style?: number;
  useSpeakerBoost?: boolean;
}

/**
 * Check if ElevenLabs API is configured
 */
export function isElevenLabsConfigured(): boolean {
  return !!ELEVENLABS_API_KEY;
}

/**
 * Get available voices from ElevenLabs
 */
export async function getVoices(): Promise<ElevenLabsVoice[]> {
  if (!isElevenLabsConfigured()) {
    throw new Error('ElevenLabs API key is not configured');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY!
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
}

/**
 * Generate speech from text using ElevenLabs API
 * @param text The text to convert to speech
 * @param options Speech generation options
 * @returns ArrayBuffer of audio data
 */
export async function generateSpeech(
  text: string,
  options: SpeechOptions
): Promise<ArrayBuffer> {
  if (!isElevenLabsConfigured()) {
    throw new Error('ElevenLabs API key is not configured');
  }

  if (!text) {
    throw new Error('Text is required for speech generation');
  }

  const {
    voiceId,
    modelId = 'eleven_turbo_v2',
    stability = 0.5,
    similarityBoost = 0.75,
    speakerId,
    style = 0,
    useSpeakerBoost = true
  } = options;

  if (!voiceId) {
    throw new Error('Voice ID is required for speech generation');
  }

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost
          },
          ...(speakerId ? { speaker_id: speakerId } : {})
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate speech: ${response.statusText} - ${errorText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}

/**
 * Get a voice by ID or use a default if not found
 */
export function getVoiceById(voiceId: string, defaultVoiceId = VOICE_ARCHETYPES.narrator): string {
  // If the voiceId is valid, use it; otherwise use the default
  return Object.values(VOICE_ARCHETYPES).includes(voiceId) ? voiceId : defaultVoiceId;
}

/**
 * Get a voice ID for a character type (for character dialogue)
 */
export function getVoiceForCharacterType(
  characterType: string, 
  gender: 'male' | 'female' | string = 'male'
): string {
  const normalizedGender = gender.toLowerCase();
  const isFemale = normalizedGender === 'female' || normalizedGender === 'f';
  
  // Map character type to voice
  switch (characterType.toLowerCase()) {
    case 'narrator':
      return isFemale ? VOICE_ARCHETYPES.narratorFemale : VOICE_ARCHETYPES.narrator;
    
    case 'young':
    case 'child':
    case 'teenager':
    case 'teen':
      return isFemale ? VOICE_ARCHETYPES.youngFemale : VOICE_ARCHETYPES.youngMale;
    
    case 'old':
    case 'elderly':
    case 'senior':
      return isFemale ? VOICE_ARCHETYPES.elderlyFemale : VOICE_ARCHETYPES.elderlyMale;
    
    case 'mystical':
    case 'magical':
    case 'wizard':
    case 'witch':
    case 'fairy':
      return VOICE_ARCHETYPES.mystical;
    
    case 'monster':
    case 'villain':
    case 'evil':
    case 'demon':
    case 'dragon':
      return VOICE_ARCHETYPES.monster;
    
    default:
      // Default to narrator
      return isFemale ? VOICE_ARCHETYPES.narratorFemale : VOICE_ARCHETYPES.narrator;
  }
} 