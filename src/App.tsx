import React, { useState } from 'react';
import TranscriptGenerator from './components/TranscriptGenerator';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-3xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">YouTube Transcript Generator</h1>
          <TranscriptGenerator />
        </div>
      </div>
    </div>
  );
}

export default App;
