'use client';

import React, { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaVolumeUp, FaInfoCircle } from 'react-icons/fa';
import { ElevenLabsVoice, VOICE_ARCHETYPES } from '@/lib/elevenlabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  onPreviewPlay?: (isPlaying: boolean) => void;
}

export default function VoiceSelector({ selectedVoice, onVoiceChange, onPreviewPlay }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [showArchetypes, setShowArchetypes] = useState(true);
  
  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/voices');
        
        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }
        
        const data = await response.json();
        setVoices(data.voices || []);
      } catch (error) {
        console.error('Error fetching voices:', error);
        setError('Failed to load voices. ElevenLabs connection may not be configured.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVoices();
    
    // Clean up on unmount
    return () => {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
      }
    };
  }, []);
  
  // Preview a voice
  const handlePreviewVoice = async (voiceId: string) => {
    // Stop any currently playing preview
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.src = '';
      setPreviewAudio(null);
    }
    
    // If the same voice is clicked again, just stop playback
    if (previewingVoice === voiceId) {
      setPreviewingVoice(null);
      onPreviewPlay?.(false);
      return;
    }
    
    try {
      setPreviewingVoice(voiceId);
      onPreviewPlay?.(true);
      
      // Get sample text based on voice type
      let sampleText = "I'm a voice from ElevenLabs. How do I sound?";
      
      // Use appropriate sample text based on voice archetype
      for (const [archetype, id] of Object.entries(VOICE_ARCHETYPES)) {
        if (id === voiceId) {
          switch (archetype) {
            case 'narrator':
              sampleText = "Welcome to Narriva. I'll be your narrator for this adventure.";
              break;
            case 'narratorFemale':
              sampleText = "Welcome to Narriva. I'll be your narrator for this adventure.";
              break;
            case 'youngMale':
              sampleText = "Hey there! I'm ready for an adventure. What's our quest?";
              break;
            case 'youngFemale':
              sampleText = "This is so exciting! I can't wait to see what happens next!";
              break;
            case 'elderlyMale':
              sampleText = "In all my years, I've never seen anything quite like this.";
              break;
            case 'elderlyFemale':
              sampleText = "Let me tell you a story from long ago, when the world was different.";
              break;
            case 'mystical':
              sampleText = "The arcane forces are strong today. Can you feel the magic in the air?";
              break;
            case 'monster':
              sampleText = "Humans fear what they don't understand. And they're right to fear me.";
              break;
          }
          break;
        }
      }
      
      // Generate preview audio via the API
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sampleText,
          voiceId: voiceId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }
      
      const data = await response.json();
      
      // Create audio element from base64 data
      const audio = new Audio();
      audio.src = `data:audio/mpeg;base64,${data.audio}`;
      
      // Set up event handlers
      audio.onended = () => {
        setPreviewingVoice(null);
        onPreviewPlay?.(false);
      };
      
      audio.onpause = () => {
        if (!audio.ended) {
          setPreviewingVoice(null);
          onPreviewPlay?.(false);
        }
      };
      
      // Play the preview
      await audio.play();
      setPreviewAudio(audio);
    } catch (error) {
      console.error('Error previewing voice:', error);
      setPreviewingVoice(null);
      onPreviewPlay?.(false);
      // Fallback to using voice samples if available
      const voice = voices.find(v => v.voice_id === voiceId);
      if (voice && voice.preview_url) {
        const audio = new Audio(voice.preview_url);
        audio.onended = () => {
          setPreviewingVoice(null);
          onPreviewPlay?.(false);
        };
        audio.play();
        setPreviewAudio(audio);
      }
    }
  };
  
  // Organize voices by category
  const voicesByCategory = voices.reduce<Record<string, ElevenLabsVoice[]>>((acc, voice) => {
    const category = voice.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(voice);
    return acc;
  }, {});
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-t-accent-amber border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-text-secondary">Loading voices...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-ui-dark rounded-lg text-text-secondary">
        <div className="flex items-center mb-2">
          <FaInfoCircle className="text-accent-red mr-2" />
          <p className="font-bold">Voice Service Unavailable</p>
        </div>
        <p className="text-sm">{error}</p>
        <p className="text-sm mt-2">Using default browser voices instead.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">Voice Selection</h3>
        <div className="flex space-x-3">
          <Button
            variant={showArchetypes ? 'primary' : 'secondary'}
            onClick={() => setShowArchetypes(true)}
            className="text-sm py-1"
          >
            Character Types
          </Button>
          <Button
            variant={!showArchetypes ? 'primary' : 'secondary'}
            onClick={() => setShowArchetypes(false)}
            className="text-sm py-1"
          >
            All Voices
          </Button>
        </div>
      </div>
      
      {showArchetypes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(VOICE_ARCHETYPES).map(([type, voiceId]) => {
            // Format the type name for display
            const formattedType = type.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase());
              
            return (
              <Card 
                key={voiceId} 
                className={`p-4 cursor-pointer transition duration-200 ${selectedVoice === voiceId ? 'border-accent-amber' : 'hover:border-gray-600'}`}
                onClick={() => onVoiceChange(voiceId)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-text-primary">{formattedType}</h4>
                    <p className="text-xs text-text-tertiary">
                      {voiceId === VOICE_ARCHETYPES.narrator ? 'Default narrator voice' : ''}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewVoice(voiceId);
                    }}
                    className={`p-2 rounded-full ${previewingVoice === voiceId ? 'bg-accent-amber text-black' : 'bg-ui-dark hover:bg-ui-dark-hover text-text-primary'}`}
                    aria-label={previewingVoice === voiceId ? 'Stop preview' : 'Preview voice'}
                  >
                    {previewingVoice === voiceId ? <FaStop /> : <FaPlay />}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <>
          {Object.entries(voicesByCategory).map(([category, categoryVoices]) => (
            <div key={category} className="mb-6">
              <h4 className="text-md font-bold text-text-primary mb-3">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryVoices.map(voice => (
                  <Card 
                    key={voice.voice_id} 
                    className={`p-3 cursor-pointer transition duration-200 ${selectedVoice === voice.voice_id ? 'border-accent-amber' : 'hover:border-gray-600'}`}
                    onClick={() => onVoiceChange(voice.voice_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-text-primary">{voice.name}</h5>
                        <p className="text-xs text-text-tertiary truncate max-w-[200px]">
                          {voice.description || 'ElevenLabs voice'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewVoice(voice.voice_id);
                        }}
                        className={`p-2 rounded-full ${previewingVoice === voice.voice_id ? 'bg-accent-amber text-black' : 'bg-ui-dark hover:bg-ui-dark-hover text-text-primary'}`}
                        aria-label={previewingVoice === voice.voice_id ? 'Stop preview' : 'Preview voice'}
                      >
                        {previewingVoice === voice.voice_id ? <FaStop /> : <FaPlay />}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
} 