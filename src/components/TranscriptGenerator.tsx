import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { transcribeVideo } from '../services/api';

interface Word {
  word: string;
  start: number;
  end: number;
}

interface TranscriptData {
  videoId: string;
  words: Word[];
}

const TranscriptGenerator: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const playerRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Extract videoId from YouTube URL
  const getVideoIdFromUrl = (url: string): string | null => {
    // Matches standard YouTube URLs, shorts, and youtu.be formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTranscriptData(null);
    
    const videoId = getVideoIdFromUrl(url);
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid URL.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Sending request for videoId:', videoId);
      const data = await transcribeVideo({ videoId });
      setTranscriptData(data);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Failed to generate transcript. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle player state change
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    // Start time tracking
    const interval = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 100);

    return () => clearInterval(interval);
  };

  // Find active word based on current time
  const getActiveWordIndex = (): number => {
    if (!transcriptData) return -1;
    
    return transcriptData.words.findIndex(
      (word) => currentTime >= word.start && currentTime <= word.end
    );
  };

  // Auto-scroll to keep active word visible
  useEffect(() => {
    const activeIndex = getActiveWordIndex();
    if (activeIndex !== -1 && transcriptRef.current) {
      const wordElements = transcriptRef.current.querySelectorAll('span');
      if (wordElements[activeIndex]) {
        wordElements[activeIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentTime, getActiveWordIndex]);

  // Generate plain text transcript for download
  const generatePlainTextTranscript = (): string => {
    if (!transcriptData) return '';
    return transcriptData.words.map(word => word.word).join(' ');
  };

  // Handle transcript download
  const handleDownload = () => {
    if (!transcriptData) return;
    
    const text = generatePlainTextTranscript();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${transcriptData.videoId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-1">
            YouTube Video URL
          </label>
          <input
            id="youtube-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube video link here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isLoading ? 'Downloading audio & generating transcript with AssemblyAI...' : 'Generate Transcript'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {transcriptData && (
        <div className="mt-6 space-y-6">
          <div className="aspect-w-16 aspect-h-9">
            <YouTube
              videoId={transcriptData.videoId}
              opts={{
                height: '100%',
                width: '100%',
                playerVars: {
                  autoplay: 0,
                }
              }}
              onReady={onPlayerReady}
            />
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Transcript</h2>
            <div 
              ref={transcriptRef}
              className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto"
            >
              <p className="whitespace-pre-wrap">
                {transcriptData.words.map((word, index) => (
                  <span
                    key={`${index}-${word.start}`}
                    data-start-time={word.start}
                    data-end-time={word.end}
                    className={`${
                      currentTime >= word.start && currentTime <= word.end
                        ? 'bg-yellow-200'
                        : ''
                    } transition-colors`}
                  >
                    {word.word}{' '}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Download .txt
          </button>
        </div>
      )}
    </div>
  );
};

export default TranscriptGenerator; 