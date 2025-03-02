'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';
import { FaVolumeUp, FaVolumeMute, FaPause, FaPlay, FaCog, FaUserCircle, FaSave } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { 
  textToSpeech, 
  pauseSpeech, 
  resumeSpeech, 
  cancelSpeech, 
  isSpeaking, 
  isPaused, 
  readStoryNode,
  getAvailableVoices,
  stopAllAudio,
  setAudioVolume
} from '@/lib/audio';
import { 
  MdOutlineSlowMotionVideo, 
  MdSpeed
} from 'react-icons/md';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Modal from '@/components/ui/Modal';
import VoiceSelector from '@/components/audio/VoiceSelector';
import NarratorUI from '../NarratorUI';
import { playSoundscape, stopSoundscape } from '@/lib/soundscapes';
import { extractGenre } from '@/types/story';
import { VOICE_ARCHETYPES } from '@/lib/elevenlabs';

// Types for our story structure
interface StoryChoice {
  id: string;
  text: string;
  nextNodeId: string;
  effects?: {
    characters?: Record<string, {
      attributes?: Record<string, number>;
      inventory?: string[];
      status?: string[];
      relationships?: Record<string, number>;
      addItems?: string[];
      removeItems?: string[];
      addStatus?: string[];
      removeStatus?: string[];
    }>;
  };
}

interface StoryNode {
  id: string;
  title: string;
  content: string;
  choices: StoryChoice[];
  background?: string;
  isStartNode: boolean;
  isEndNode: boolean;
  imageUrl?: string;
  audioUrl?: string;
  metadata?: {
    genre?: string;
    mood?: string;
    setting?: string;
  };
}

interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  storyNodes: StoryNode[];
  characters?: Array<{
    id: string;
    name: string;
    attributes?: Record<string, number>;
    inventory?: string[];
    status?: string[];
  }>;
}

interface ReadingProgress {
  id: string;
  userId: string;
  storyId: string;
  currentNodeId: string;
  progress: number;
  visitedNodes: string[];
}

// New types for user preferences and story state
interface UserPreferences {
  favoriteGenre: string;
  preferredTone: string;
  preferredComplexity: string;
  preferredVoice: string;
  preferredSpeechRate: number;
  preferredTextSize: 'small' | 'medium' | 'large';
  darkMode: boolean;
  characterTrackingEnabled: boolean;
}

interface CharacterState {
  id: string;
  name: string;
  attributes: {
    [key: string]: number; // e.g., strength: 10, intelligence: 8
  };
  inventory: string[];
  relationships: {
    [key: string]: number; // e.g., "Elara": 75 (positive), "The Witch": -50 (negative)
  };
  status: string[];
}

interface StoryReaderProps {
  story: Story;
  initialProgress?: ReadingProgress;
}

const StoryReader: React.FC<StoryReaderProps> = ({ story, initialProgress }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // State for current node and history
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(
    initialProgress?.currentNodeId || (story.storyNodes.find(node => node.isStartNode)?.id || null)
  );
  const [nodeHistory, setNodeHistory] = useState<string[]>(
    initialProgress?.visitedNodes || []
  );
  const [isLoading, setIsLoading] = useState(false);
  
  // User preferences state
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteGenre: '',
    preferredTone: 'balanced',
    preferredComplexity: 'medium',
    preferredVoice: '',
    preferredSpeechRate: 1,
    preferredTextSize: 'medium',
    darkMode: true,
    characterTrackingEnabled: true
  });
  
  // Character state tracking
  const [characterStates, setCharacterStates] = useState<CharacterState[]>([]);
  const [showCharacterPanel, setShowCharacterPanel] = useState(false);
  
  // Decision tracking to personalize future nodes
  const [decisionHistory, setDecisionHistory] = useState<{nodeId: string, choiceText: string}[]>([]);
  
  // Audio state
  const [isAudioEnabled, setIsAudioEnabled] = useLocalStorage('narriva-audio-enabled', true);
  const [isSoundscapeEnabled, setIsSoundscapeEnabled] = useLocalStorage('narriva-soundscape-enabled', false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [speechRate, setSpeechRate] = useLocalStorage('narriva-speech-rate', 1);
  const [selectedVoice, setSelectedVoice] = useLocalStorage('narriva-narrator-voice', VOICE_ARCHETYPES.narrator);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Text size state
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // Settings panel state
  const [showSettings, setShowSettings] = useState(false);
  
  // Animation state
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Store the last node ID to detect changes
  const lastNodeIdRef = useRef<string | null>(null);
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Get current node
  const currentNode = story.storyNodes.find(node => node.id === currentNodeId);
  
  // Calculate progress percentage
  const progressPercentage = Math.round(
    (nodeHistory.length / story.storyNodes.length) * 100
  );
  
  // Load user preferences and story state
  useEffect(() => {
    // Load voices for speech synthesis
    const voices = getAvailableVoices();
    setAvailableVoices(voices);
    
    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('narriva_user_preferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setUserPreferences(prev => ({...prev, ...preferences}));
      
      // Apply saved voice and speech rate preferences
      if (preferences.preferredVoice) {
        setSelectedVoice(preferences.preferredVoice);
      }
      
      if (preferences.preferredSpeechRate) {
        setSpeechRate(preferences.preferredSpeechRate);
      }
      
      if (preferences.preferredTextSize) {
        setTextSize(preferences.preferredTextSize);
      }
    }
    
    // Load story-specific state if available
    if (session?.user?.id && story.id) {
      const storyStateKey = `narriva_story_${story.id}_${session.user.id}`;
      const savedStoryState = localStorage.getItem(storyStateKey);
      
      if (savedStoryState) {
        try {
          const storyState = JSON.parse(savedStoryState);
          
          // Restore character states if available
          if (storyState.characterStates) {
            setCharacterStates(storyState.characterStates);
          }
          
          // Restore decision history if available
          if (storyState.decisionHistory) {
            setDecisionHistory(storyState.decisionHistory);
          }
        } catch (error) {
          console.error('Error parsing saved story state:', error);
        }
      } else {
        // Initialize character states from story data if available
        if (story.characters) {
          const initialCharacterStates = story.characters.map(char => ({
            id: char.id,
            name: char.name,
            attributes: {
              strength: 10,
              intelligence: 10,
              charisma: 10,
              luck: 10,
              health: 100
            },
            inventory: [],
            relationships: {},
            status: []
          }));
          
          setCharacterStates(initialCharacterStates);
        }
      }
    }
  }, [session, story.id]);
  
  // Save story state whenever it changes
  useEffect(() => {
    if (session?.user?.id && story.id && characterStates.length > 0) {
      const storyStateKey = `narriva_story_${story.id}_${session.user.id}`;
      
      const storyState = {
        characterStates,
        decisionHistory,
        lastVisited: new Date().toISOString()
      };
      
      localStorage.setItem(storyStateKey, JSON.stringify(storyState));
    }
  }, [characterStates, decisionHistory, session?.user?.id, story.id]);
  
  // Update reading progress in the database
  const updateReadingProgress = async () => {
    if (!session || !currentNodeId) return;
    
    try {
      await fetch(`/api/stories/${story.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentNodeId,
          visitedNodes: nodeHistory,
          progress: progressPercentage,
          characterStates: characterStates,
          decisionHistory: decisionHistory
        }),
      });
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  };
  
  // Save user preferences
  const saveUserPreferences = () => {
    const updatedPreferences = {
      ...userPreferences,
      preferredVoice: selectedVoice,
      preferredSpeechRate: speechRate,
      preferredTextSize: textSize
    };
    
    localStorage.setItem('narriva_user_preferences', JSON.stringify(updatedPreferences));
    setUserPreferences(updatedPreferences);
    showToast('Preferences saved', 'success');
    setShowSettings(false);
  };
  
  // Update character attributes based on choice
  const updateCharacterAttributes = (choice: StoryChoice) => {
    if (!choice.effects || !characterStates.length) return;
    
    const updatedCharacterStates = characterStates.map(character => {
      const characterEffects = choice.effects?.characters?.[character.id];
      
      if (!characterEffects) return character;
      
      // Create copies of current state to modify
      const updatedAttributes = { ...character.attributes };
      let updatedInventory = [...character.inventory];
      let updatedStatus = [...character.status];
      const updatedRelationships = { ...character.relationships };
      
      if (characterEffects.attributes) {
        Object.entries(characterEffects.attributes).forEach(([attr, change]) => {
          updatedAttributes[attr] = Math.max(0, Math.min(100, (updatedAttributes[attr] || 0) + (change as number)));
        });
      }
      
      if (characterEffects.addItems) {
        updatedInventory = [...updatedInventory, ...characterEffects.addItems];
      }
      
      if (characterEffects.removeItems) {
        updatedInventory = updatedInventory.filter(item => !characterEffects.removeItems?.includes(item));
      }
      
      if (characterEffects.relationships) {
        Object.entries(characterEffects.relationships).forEach(([charId, change]) => {
          updatedRelationships[charId] = Math.max(-100, Math.min(100, (updatedRelationships[charId] || 0) + (change as number)));
        });
      }
      
      if (characterEffects.addStatus) {
        updatedStatus = [...updatedStatus, ...characterEffects.addStatus];
      }
      
      if (characterEffects.removeStatus) {
        updatedStatus = updatedStatus.filter(status => !characterEffects.removeStatus?.includes(status));
      }
      
      return {
        ...character,
        attributes: updatedAttributes,
        inventory: updatedInventory,
        status: updatedStatus,
        relationships: updatedRelationships
      };
    });
    
    setCharacterStates(updatedCharacterStates);
  };
  
  // Handle choice selection
  const handleChoiceSelect = async (choice: StoryChoice) => {
    // Add to decision history for personalization
    setDecisionHistory([...decisionHistory, {
      nodeId: currentNodeId!,
      choiceText: choice.text
    }]);
    
    // Update character attributes based on choice effects
    updateCharacterAttributes(choice);
    
    if (!choice.nextNodeId) {
      // If no target node, we need to generate one
      setIsLoading(true);
      
      try {
        // Include decision history and character states for more personalized content
        const personalizedContext = {
          decisionHistory: decisionHistory,
          characterStates: characterStates,
          userPreferences: userPreferences
        };
        
        const response = await fetch('/api/stories/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyId: story.id,
            prompt: story.description,
            previousContent: currentNode?.content,
            choices: [choice.text],
            context: personalizedContext // Pass context for personalized generation
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate story content');
        }
        
        // Update the choice with the new target node
        choice.nextNodeId = data.node.id;
        
        // Update the story with the new node
        story.storyNodes.push(data.node);
        
        // Refresh the page to get the updated story
        router.refresh();
      } catch (error) {
        console.error('Error generating story content:', error);
        showToast('Failed to generate story content. Please try again.', 'error');
        setIsLoading(false);
        return;
      }
    }
    
    // Animate transition
    setIsTransitioning(true);
    
    // After a short delay, update the current node
    setTimeout(() => {
      if (choice.nextNodeId) {
        setCurrentNodeId(choice.nextNodeId);
        setNodeHistory(prev => [...prev, choice.nextNodeId]);
      }
      setIsTransitioning(false);
      setIsLoading(false);
      
      // Scroll to top of content
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }, 500);
  };
  
  // Toggle audio
  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    
    if (!newState) {
      // If turning off, stop any current narration
      stopAllAudio();
      setIsPlaying(false);
      setIsPaused(false);
      setAudioProgress(0);
    } else if (currentNode && currentNode.content) {
      // If turning on, start narration
      startAudioNarration();
    }
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSpeech();
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      if (isPaused) {
        resumeSpeech();
        setIsPlaying(true);
        setIsPaused(false);
      } else if (audioProgress > 0) {
        resumeSpeech();
        setIsPlaying(true);
        setIsPaused(false);
      } else {
        startAudioNarration();
      }
    }
  };
  
  // Toggle soundscape
  const toggleSoundscape = () => {
    const newState = !isSoundscapeEnabled;
    setIsSoundscapeEnabled(newState);
    
    if (!newState && currentSoundscape) {
      stopSoundscape(currentSoundscape);
      setCurrentSoundscape(null);
    } else if (newState && currentNode) {
      startSoundscape();
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Apply volume based on mute state
    try {
      setAudioVolume(newMuteState ? 0 : 1);
    } catch (error) {
      console.error('Error setting audio volume:', error);
    }
  };
  
  // Start audio narration for a node
  const startAudioNarration = () => {
    if (!currentNode || !currentNode.content || !isAudioEnabled) return;
    
    // Cancel any existing speech
    cancelSpeech();
    
    // Start reading the story node
    setIsPlaying(true);
    setIsPaused(false);
    setAudioProgress(0);
    
    readStoryNode(currentNode, {
      voiceId: selectedVoice,
      rate: speechRate,
      volume: isMuted ? 0 : 1,
      onProgress: (progress) => {
        setAudioProgress(progress);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setAudioProgress(1); // Mark as complete
      },
      onPause: () => {
        setIsPlaying(false);
        setIsPaused(true);
      },
      onResume: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onError: (error) => {
        console.error('Speech error:', error);
        setIsPlaying(false);
        setIsPaused(false);
      }
    });
  };
  
  // Start appropriate soundscape based on story content
  const startSoundscape = () => {
    if (!currentNode || !isSoundscapeEnabled) return;
    
    // Extract genre from story metadata or content
    const genre = currentNode.metadata?.genre || extractGenre(currentNode.content);
    
    // Stop current soundscape if any
    if (currentSoundscape) {
      stopSoundscape(currentSoundscape);
    }
    
    // Determine appropriate soundscape based on genre and content
    let soundscapeId;
    const content = currentNode.content.toLowerCase();
    
    if (content.includes('forest') || content.includes('woods') || content.includes('jungle')) {
      soundscapeId = 'forest';
    } else if (content.includes('city') || content.includes('town') || content.includes('urban')) {
      soundscapeId = 'city';
    } else if (content.includes('space') || content.includes('spaceship') || content.includes('galaxy')) {
      soundscapeId = 'space';
    } else if (content.includes('battle') || content.includes('fight') || content.includes('war')) {
      soundscapeId = 'battle';
    } else if (content.includes('ocean') || content.includes('sea') || content.includes('water')) {
      soundscapeId = 'ocean';
    } else if (content.includes('rain') || content.includes('storm') || content.includes('thunder')) {
      soundscapeId = 'rain';
    } else if (genre === 'fantasy') {
      soundscapeId = 'fantasy';
    } else if (genre === 'horror') {
      soundscapeId = 'horror';
    } else if (genre === 'sci-fi') {
      soundscapeId = 'space';
    } else {
      soundscapeId = 'ambient';
    }
    
    // Play the selected soundscape
    playSoundscape(soundscapeId);
    setCurrentSoundscape(soundscapeId);
  };
  
  // Update narration when node changes
  useEffect(() => {
    if (isAudioEnabled && currentNode) {
      startAudioNarration();
    }
  }, [currentNodeId]);
  
  // Update reading progress when current node changes
  useEffect(() => {
    if (currentNodeId) {
      updateReadingProgress();
    }
  }, [currentNodeId, nodeHistory, characterStates]);
  
  // Text size class based on preference
  const getTextSizeClass = () => {
    switch (textSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-xl';
      default: return 'text-base';
    }
  };
  
  // If no current node, show loading state
  if (!currentNode) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-t-accent-amber border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-text-secondary">Loading story...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Progress bar and controls */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-amber-100 py-2"
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex-grow mr-4">
              <div className="h-2 bg-amber-50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400"
                  style={{ width: `${progressPercentage}%` }}
                  animate={{
                    width: `${progressPercentage}%`,
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    width: { duration: 0.5 },
                    backgroundPosition: { duration: 10, repeat: Infinity, ease: "linear" }
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCharacterPanel(!showCharacterPanel)}
                className={`p-2 rounded-full ${showCharacterPanel ? 'bg-amber-100' : 'bg-white hover:bg-amber-50 border border-amber-100'} transition-colors`}
                aria-label="Toggle character panel"
              >
                <FaUserCircle className={showCharacterPanel ? 'text-amber-500' : 'text-slate-600'} />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAudio}
                className={`p-2 rounded-full ${isAudioEnabled ? 'bg-amber-100' : 'bg-white hover:bg-amber-50 border border-amber-100'} transition-colors`}
                aria-label={isAudioEnabled ? 'Disable audio' : 'Enable audio'}
              >
                {isAudioEnabled ? <FaVolumeUp className="text-amber-500" /> : <FaVolumeMute className="text-slate-600" />}
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSoundscape}
                className={`p-2 rounded-full ${isSoundscapeEnabled ? 'bg-amber-100' : 'bg-white hover:bg-amber-50 border border-amber-100'} transition-colors`}
                aria-label={isSoundscapeEnabled ? 'Disable ambient soundscape' : 'Enable ambient soundscape'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isSoundscapeEnabled ? "#f59e0b" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 10V14C2 16 3 17 5 17H7V7H5C3 7 2 8 2 10Z" />
                  <path d="M14 4V20C14 21 13 22 12 22C11 22 10 21 10 20V4C10 3 11 2 12 2C13 2 14 3 14 4Z" />
                  <path d="M22 10V14C22 16 21 17 19 17H17V7H19C21 7 22 8 22 10Z" />
                </svg>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full ${showSettings ? 'bg-amber-100' : 'bg-white hover:bg-amber-50 border border-amber-100'} transition-colors`}
                aria-label="Settings"
              >
                <FaCog className={showSettings ? 'text-amber-500' : 'text-slate-600'} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Background glow effect when audio is playing */}
      {isAudioEnabled && isPlaying && (
        <motion.div 
          className="fixed inset-0 pointer-events-none z-0"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.1, 0.15, 0.1],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/15 via-transparent to-transparent" 
               style={{ 
                 transform: 'scale(1.5)',
                 filter: 'blur(70px)'
               }}
          />
        </motion.div>
      )}
      
      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-14 z-10 w-full bg-white border-b border-amber-100 shadow-md"
          >
            <div className="container mx-auto px-6 py-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Reading Settings</h3>
                  <button onClick={saveUserPreferences} className="flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-opacity-90 transition-colors shadow-sm">
                    <FaSave className="mr-1" /> Save Preferences
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 mb-2">Text Size</h4>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setTextSize('small')} 
                        className={`px-3 py-1 text-sm rounded transition-colors ${textSize === 'small' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-amber-50 text-slate-700'}`}
                      >
                        Small
                      </button>
                      <button 
                        onClick={() => setTextSize('medium')} 
                        className={`px-3 py-1 text-sm rounded transition-colors ${textSize === 'medium' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-amber-50 text-slate-700'}`}
                      >
                        Medium
                      </button>
                      <button 
                        onClick={() => setTextSize('large')} 
                        className={`px-3 py-1 text-sm rounded transition-colors ${textSize === 'large' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-amber-50 text-slate-700'}`}
                      >
                        Large
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 mb-2">Voice</h4>
                    <select 
                      value={selectedVoice} 
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white text-slate-800 border border-amber-200 focus:border-amber-400 focus:outline-none transition-colors"
                    >
                      <option value="">Default Voice</option>
                      {availableVoices.map(voice => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 mb-2">Character Tracking</h4>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={userPreferences.characterTrackingEnabled}
                        onChange={() => setUserPreferences({
                          ...userPreferences,
                          characterTrackingEnabled: !userPreferences.characterTrackingEnabled
                        })}
                        className="form-checkbox h-5 w-5 text-amber-500 border-amber-200 rounded bg-white focus:ring-amber-400"
                      />
                      <span className="ml-2 text-slate-700">Enable character attribute tracking</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content container with flexible layout */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row">
          {/* Character panel (conditional) */}
          <AnimatePresence>
            {showCharacterPanel && characterStates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 'auto' }}
                exit={{ opacity: 0, x: -20, width: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="md:w-64 md:sticky md:top-32 md:self-start mb-6 md:mb-0 md:mr-6"
              >
                <div className="card-glow p-4 bg-glass animated-border">
                  <h3 className="text-lg font-bold text-gradient mb-4">Characters</h3>
                  
                  <div className="space-y-6">
                    {characterStates.map((character, index) => (
                      <motion.div 
                        key={character.id} 
                        className="border-b border-amber-100 pb-4 last:border-b-0 last:pb-0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h4 className="font-bold text-slate-800 mb-2">{character.name}</h4>
                        
                        {/* Attributes */}
                        <div className="space-y-2 mb-3">
                          {Object.entries(character.attributes).map(([attrName, value], attrIndex) => (
                            <div key={attrName} className="flex items-center">
                              <span className="text-xs text-slate-500 capitalize w-24">{attrName}:</span>
                              <div className="flex-grow h-1.5 bg-amber-50 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value}%` }}
                                  transition={{ 
                                    duration: 1, 
                                    delay: (index * 0.1) + (attrIndex * 0.05),
                                    ease: "easeOut"
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-600 ml-2">{value}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Inventory */}
                        {character.inventory.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-xs font-medium text-slate-600 mb-1">Inventory:</h5>
                            <div className="flex flex-wrap gap-1">
                              {character.inventory.map((item, idx) => (
                                <motion.span 
                                  key={idx} 
                                  className="text-xs bg-amber-50 px-2 py-0.5 rounded-full text-slate-700 shimmer"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 + (idx * 0.05) }}
                                >
                                  {item}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Status */}
                        {character.status.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-slate-600 mb-1">Status:</h5>
                            <div className="flex flex-wrap gap-1">
                              {character.status.map((status, idx) => (
                                <motion.span 
                                  key={idx} 
                                  className="text-xs bg-orange-50 px-2 py-0.5 rounded-full text-orange-600"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 + (idx * 0.05) }}
                                >
                                  {status}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Story content */}
          <div className={`flex-grow ${showCharacterPanel ? 'md:max-w-2xl' : 'max-w-3xl'} mx-auto`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNodeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
                className="mb-8"
              >
                {/* Story node content */}
                <div className="card-glow p-8 mb-8 prose prose-amber max-w-none bg-glass">
                  {/* Narrator UI - only shown when audio is enabled */}
                  {isAudioEnabled && (
                    <div className="mb-6">
                      <NarratorUI 
                        isPlaying={isPlaying}
                        isPaused={isPaused}
                        isMuted={isMuted}
                        progress={audioProgress}
                        speechRate={speechRate}
                        onPlayPause={togglePlayPause}
                        onMute={toggleMute}
                        onChangeSpeechRate={setSpeechRate}
                      />
                    </div>
                  )}
                  
                  <div ref={contentRef} className="max-h-[70vh] overflow-y-auto pr-4 font-serif">
                    {currentNode.imageUrl && (
                      <motion.img 
                        src={currentNode.imageUrl} 
                        alt="Story illustration" 
                        className="w-full h-64 object-cover rounded-lg mb-6 shadow-glow-soft"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    )}
                    
                    {currentNode.content.split('\n').map((paragraph, index) => (
                      <motion.p 
                        key={index} 
                        className={`mb-4 leading-relaxed text-slate-700 ${getTextSizeClass()} ${isPlaying ? 'narrating-text' : ''}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 + (index * 0.05) }}
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                    
                    {/* Hidden audio element */}
                    {currentNode.audioUrl && (
                      <audio
                        ref={audioRef}
                        src={currentNode.audioUrl}
                        onTimeUpdate={() => {}}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    )}
                  </div>
                </div>
                
                {/* Interactive story controls - Removed for listening-only experience */}
                {currentNode.isEndNode && (
                  <motion.div 
                    className="mt-8 flex flex-col items-center space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <h3 className="text-xl font-bold text-gradient">The End</h3>
                    <p className="text-slate-600">Thank you for experiencing this story.</p>
                    <Button
                      variant="primary"
                      onClick={() => router.push('/stories')}
                    >
                      Explore More Stories
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Audio settings modal */}
      <Modal
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
        title="Voice & Audio Settings"
      >
        <div className="space-y-6 p-1">
          {/* Speech rate slider */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">Narration Speed</h3>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600">Slow</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="flex-grow accent-amber-500"
              />
              <span className="text-slate-600">Fast</span>
              <span className="text-sm text-slate-700 ml-2">{speechRate.toFixed(1)}x</span>
            </div>
          </div>
          
          {/* Voice selector */}
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceChange={(voiceId) => setSelectedVoice(voiceId)}
          />
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowAudioSettings(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StoryReader; 