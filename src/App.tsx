import React from 'react';
import TranscriptGenerator from './components/TranscriptGenerator';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 flex flex-col">
      <div className="max-w-5xl mx-auto flex-grow">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">YouTube Transcript Generator</h1>
        <p className="text-center text-gray-600 mb-8">Generate accurate transcripts from YouTube videos using AssemblyAI's Speech-to-Text API</p>
        <TranscriptGenerator />
      </div>
      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
          <p className="text-gray-600 text-sm text-center">
            Built with <span className="text-red-500">❤</span> using React, TypeScript, and AssemblyAI
          </p>
          <div className="flex space-x-4 mt-3">
            <a href="https://github.com/yuenmun/utoob" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://www.assemblyai.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
              <span className="sr-only">AssemblyAI</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
