import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    setIsLoading(true); // Set loading state to true when starting
    
    const videoId = getVideoIdFromUrl(url);
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid URL.');
      setIsLoading(false); // Reset loading state on error
      return;
    }

    try {
      console.log('Sending request for videoId:', videoId);
      const data = await transcribeVideo({ videoId });
      setTranscriptData(data);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Failed to generate transcript. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state whether successful or not
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
  const getActiveWordIndex = useCallback((): number => {
    if (!transcriptData) return -1;
    
    return transcriptData.words.findIndex(
      (word) => currentTime >= word.start && currentTime <= word.end
    );
  }, [currentTime, transcriptData]);

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
    <div className="flex flex-col space-y-6 p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating transcript...' : 'Generate Transcript'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-solid rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 font-medium mt-4">Downloading audio & generating transcript with AssemblyAI...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a minute or two depending on the video length.</p>
          <div className="mt-4 w-full max-w-md bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      )}

      {transcriptData && !isLoading && (
        <div className="mt-6 space-y-6">
          <div className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ paddingBottom: '56.25%' }}>
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
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Transcript</h2>
            <div 
              ref={transcriptRef}
              className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto border border-gray-200"
            >
              <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {transcriptData.words.map((word, index) => (
                  <span
                    key={`${index}-${word.start}`}
                    data-start-time={word.start}
                    data-end-time={word.end}
                    className={`${
                      currentTime >= word.start && currentTime <= word.end
                        ? 'bg-yellow-200 font-medium'
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Transcript (.txt)
          </button>
        </div>
      )}
    </div>
  );
};

export default TranscriptGenerator; 