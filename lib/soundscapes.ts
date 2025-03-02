'use client';

/**
 * Ambient Soundscapes Service
 * 
 * This file contains utilities for managing ambient soundscapes
 * that enhance the storytelling experience by providing appropriate
 * background audio based on the story genre, setting, and mood.
 */

// Track interface for individual audio tracks
export interface SoundscapeTrack {
  id: string;
  name: string;
  url: string;
  category: 'ambient' | 'effects' | 'music';
  loop: boolean;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}

// Soundscape interface containing multiple tracks
export interface Soundscape {
  id: string;
  name: string;
  description?: string;
  tracks: SoundscapeTrack[];
}

// Collection of ambient soundscape tracks
const TRACKS: Record<string, SoundscapeTrack> = {
  // Ambient backgrounds
  'ambient-forest': {
    id: 'ambient-forest',
    name: 'Forest Ambience',
    url: 'https://audio.narriva.com/ambient/forest-ambience.mp3',
    category: 'ambient',
    loop: true,
    volume: 0.4,
    fadeIn: 2000,
    fadeOut: 1500
  },
  'ambient-rain': {
    id: 'ambient-rain',
    name: 'Gentle Rain',
    url: 'https://audio.narriva.com/ambient/gentle-rain.mp3',
    category: 'ambient',
    loop: true,
    volume: 0.5,
    fadeIn: 3000,
    fadeOut: 2000
  },
  'ambient-night': {
    id: 'ambient-night',
    name: 'Night Crickets',
    url: 'https://audio.narriva.com/ambient/night-crickets.mp3',
    category: 'ambient',
    loop: true,
    volume: 0.3,
    fadeIn: 2000,
    fadeOut: 1500
  },
  'ambient-ocean': {
    id: 'ambient-ocean',
    name: 'Ocean Waves',
    url: 'https://audio.narriva.com/ambient/ocean-waves.mp3',
    category: 'ambient',
    loop: true,
    volume: 0.4,
    fadeIn: 2500,
    fadeOut: 2000
  },
  'ambient-city': {
    id: 'ambient-city',
    name: 'City Ambience',
    url: 'https://audio.narriva.com/ambient/city-ambience.mp3',
    category: 'ambient',
    loop: true,
    volume: 0.25,
    fadeIn: 2000,
    fadeOut: 1500
  },
  'ambient-space': {
    id: 'ambient-space',
    name: 'Space Hum',
    url: 'https://audio.narriva.com/ambient/space-hum.mp3',
    category: 'ambient',
    loop: true,
    volume: 0.2,
    fadeIn: 4000,
    fadeOut: 3000
  },
  
  // Music tracks
  'music-adventure': {
    id: 'music-adventure',
    name: 'Adventure Theme',
    url: 'https://audio.narriva.com/music/adventure-theme.mp3',
    category: 'music',
    loop: true,
    volume: 0.2,
    fadeIn: 3000,
    fadeOut: 2500
  },
  'music-suspense': {
    id: 'music-suspense',
    name: 'Suspense',
    url: 'https://audio.narriva.com/music/suspense.mp3',
    category: 'music',
    loop: true,
    volume: 0.15,
    fadeIn: 4000,
    fadeOut: 3000
  },
  'music-fantasy': {
    id: 'music-fantasy',
    name: 'Fantasy Theme',
    url: 'https://audio.narriva.com/music/fantasy-theme.mp3',
    category: 'music',
    loop: true,
    volume: 0.25,
    fadeIn: 3000,
    fadeOut: 2500
  },
  'music-horror': {
    id: 'music-horror',
    name: 'Horror Theme',
    url: 'https://audio.narriva.com/music/horror-atmosphere.mp3',
    category: 'music',
    loop: true,
    volume: 0.2,
    fadeIn: 5000,
    fadeOut: 4000
  },
  
  // Effect sounds
  'effect-battle': {
    id: 'effect-battle',
    name: 'Battle Sounds',
    url: 'https://audio.narriva.com/effects/battle-sounds.mp3',
    category: 'effects',
    loop: true,
    volume: 0.3,
    fadeIn: 2000,
    fadeOut: 1500
  },
  'effect-magic': {
    id: 'effect-magic',
    name: 'Magic Ambience',
    url: 'https://audio.narriva.com/effects/magic-ambience.mp3',
    category: 'effects',
    loop: true,
    volume: 0.25,
    fadeIn: 1500,
    fadeOut: 1000
  },
  'effect-crowd': {
    id: 'effect-crowd',
    name: 'Crowd Murmur',
    url: 'https://audio.narriva.com/effects/crowd-murmur.mp3',
    category: 'effects',
    loop: true,
    volume: 0.2,
    fadeIn: 2000,
    fadeOut: 1500
  }
};

// Predefined soundscapes combining multiple tracks
export const SOUNDSCAPES: Record<string, Soundscape> = {
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Peaceful forest ambience',
    tracks: [TRACKS['ambient-forest']]
  },
  rain: {
    id: 'rain',
    name: 'Rainy Day',
    description: 'Gentle rain falling',
    tracks: [TRACKS['ambient-rain']]
  },
  night: {
    id: 'night',
    name: 'Night',
    description: 'Peaceful night with crickets',
    tracks: [TRACKS['ambient-night']]
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calming ocean waves',
    tracks: [TRACKS['ambient-ocean']]
  },
  city: {
    id: 'city',
    name: 'City',
    description: 'Urban city environment',
    tracks: [TRACKS['ambient-city']]
  },
  space: {
    id: 'space',
    name: 'Space',
    description: 'Deep space ambience',
    tracks: [TRACKS['ambient-space']]
  },
  fantasy: {
    id: 'fantasy',
    name: 'Fantasy Adventure',
    description: 'Magical fantasy setting',
    tracks: [
      { ...TRACKS['ambient-forest'], volume: 0.2 },
      TRACKS['music-fantasy']
    ]
  },
  battle: {
    id: 'battle',
    name: 'Battle',
    description: 'Action and conflict',
    tracks: [
      { ...TRACKS['effect-battle'], volume: 0.3 },
      { ...TRACKS['music-suspense'], volume: 0.15 }
    ]
  },
  horror: {
    id: 'horror',
    name: 'Horror',
    description: 'Scary and tense atmosphere',
    tracks: [
      { ...TRACKS['ambient-night'], volume: 0.15 },
      TRACKS['music-horror']
    ]
  },
  ambient: {
    id: 'ambient',
    name: 'Ambient Background',
    description: 'Neutral background ambience',
    tracks: [
      { ...TRACKS['ambient-city'], volume: 0.1 }
    ]
  }
};

// Store active audio players
const activePlayers: Record<string, HTMLAudioElement[]> = {};

/**
 * Play a soundscape
 * @param soundscape The soundscape ID or soundscape object to play
 * @param options Optional configuration for playback
 */
export function playSoundscape(
  soundscape: string | Soundscape,
  options: { fadeIn?: boolean } = {}
): void {
  // Get the soundscape from ID if string is provided
  const soundscapeObj: Soundscape | undefined = 
    typeof soundscape === 'string' ? SOUNDSCAPES[soundscape] : soundscape;
  
  if (!soundscapeObj) {
    console.error(`Soundscape "${soundscape}" not found`);
    return;
  }
  
  // If already playing, stop it first
  if (activePlayers[soundscapeObj.id]) {
    stopSoundscape(soundscapeObj.id);
  }
  
  // Create array to hold audio elements
  activePlayers[soundscapeObj.id] = [];
  
  // Create and play each track
  soundscapeObj.tracks.forEach((track) => {
    const audio = new Audio(track.url);
    
    // Configure audio properties
    audio.loop = track.loop;
    audio.volume = 0; // Start at 0 and fade in
    
    // Store audio element
    activePlayers[soundscapeObj.id].push(audio);
    
    // Play the audio
    audio.play().catch((error) => {
      console.error(`Error playing soundscape track: ${error}`);
    });
    
    // Fade in if specified
    if (options.fadeIn !== false && track.fadeIn) {
      fadeAudioIn(audio, track.volume, track.fadeIn);
    } else {
      audio.volume = track.volume;
    }
  });
}

/**
 * Stop a soundscape
 * @param soundscapeId The ID of the soundscape to stop
 * @param options Optional configuration for stopping
 */
export function stopSoundscape(
  soundscapeId: string,
  options: { fadeOut?: boolean } = {}
): void {
  const players = activePlayers[soundscapeId];
  
  if (!players || players.length === 0) {
    return;
  }
  
  const soundscape = SOUNDSCAPES[soundscapeId];
  
  // Process each track
  players.forEach((audio, index) => {
    const track = soundscape?.tracks[index];
    
    if (options.fadeOut !== false && track?.fadeOut) {
      // Fade out and then stop
      fadeAudioOut(audio, track.fadeOut, () => {
        audio.pause();
        audio.src = '';
      });
    } else {
      // Stop immediately
      audio.pause();
      audio.src = '';
    }
  });
  
  // Remove from active players after fade out
  setTimeout(() => {
    delete activePlayers[soundscapeId];
  }, 5000); // Allow time for fade out to complete
}

/**
 * Stop all soundscapes
 */
export function stopAllSoundscapes(): void {
  Object.keys(activePlayers).forEach((id) => {
    stopSoundscape(id);
  });
}

/**
 * Adjust volume of a soundscape
 * @param soundscapeId The ID of the soundscape
 * @param volume Volume multiplier (0-1)
 */
export function adjustSoundscapeVolume(soundscapeId: string, volume: number): void {
  const players = activePlayers[soundscapeId];
  
  if (!players || players.length === 0) {
    return;
  }
  
  const soundscape = SOUNDSCAPES[soundscapeId];
  
  // Adjust volume for each track
  players.forEach((audio, index) => {
    const track = soundscape?.tracks[index];
    if (track) {
      audio.volume = track.volume * Math.max(0, Math.min(1, volume));
    }
  });
}

/**
 * Find a suitable soundscape for a given genre and mood
 * @param genre The genre of the story
 * @param mood Optional mood descriptor
 * @returns The ID of an appropriate soundscape
 */
export function findSoundscapeForGenre(genre: string, mood?: string): string {
  const genreLower = genre.toLowerCase();
  const moodLower = mood?.toLowerCase() || '';
  
  // Match based on genre
  if (genreLower.includes('fantasy')) {
    if (moodLower.includes('battle') || moodLower.includes('fight')) {
      return 'battle';
    }
    return 'fantasy';
  } else if (genreLower.includes('horror') || genreLower.includes('scary')) {
    return 'horror';
  } else if (genreLower.includes('sci-fi') || genreLower.includes('space')) {
    return 'space';
  } else if (genreLower.includes('ocean') || genreLower.includes('sea')) {
    return 'ocean';
  } else if (genreLower.includes('city') || genreLower.includes('urban')) {
    return 'city';
  } else if (genreLower.includes('forest') || genreLower.includes('nature')) {
    return 'forest';
  }
  
  // Match based on mood if no genre match
  if (moodLower.includes('peaceful') || moodLower.includes('calm')) {
    return 'forest';
  } else if (moodLower.includes('tense') || moodLower.includes('scary')) {
    return 'horror';
  } else if (moodLower.includes('adventurous')) {
    return 'fantasy';
  }
  
  // Default
  return 'ambient';
}

/**
 * Fade in audio gradually
 */
function fadeAudioIn(audio: HTMLAudioElement, targetVolume: number, duration: number): void {
  const startTime = performance.now();
  const startVolume = audio.volume;
  
  function fadeStep() {
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    audio.volume = startVolume + (targetVolume - startVolume) * progress;
    
    if (progress < 1) {
      requestAnimationFrame(fadeStep);
    }
  }
  
  requestAnimationFrame(fadeStep);
}

/**
 * Fade out audio gradually
 */
function fadeAudioOut(
  audio: HTMLAudioElement, 
  duration: number, 
  callback?: () => void
): void {
  const startTime = performance.now();
  const startVolume = audio.volume;
  
  function fadeStep() {
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    audio.volume = startVolume * (1 - progress);
    
    if (progress < 1) {
      requestAnimationFrame(fadeStep);
    } else if (callback) {
      callback();
    }
  }
  
  requestAnimationFrame(fadeStep);
} 