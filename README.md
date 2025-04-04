# YouTube Transcript Generator

A web application that allows users to generate transcripts from YouTube videos using AssemblyAI for Speech-to-Text, and displays the transcript with word-by-word highlighting synchronized to the video playback.

## Features

- YouTube video URL input
- Audio extraction from YouTube videos
- Speech-to-Text using AssemblyAI API
- Word-by-word transcript highlighting synchronized with video playback
- Downloadable transcript in .txt format
- Error handling for invalid URLs and failed transcriptions

## Prerequisites

- Node.js (v14 or higher)
- npm
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed globally

## Setup

1. Clone this repository

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the project root with your AssemblyAI API key
   ```
   REACT_APP_ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   ```

4. Install yt-dlp (if not already installed)
   - On macOS: `brew install yt-dlp`
   - On Linux: `apt-get install yt-dlp` or use pip: `pip install yt-dlp`
   - On Windows: Follow instructions at [yt-dlp GitHub repository](https://github.com/yt-dlp/yt-dlp#installation)

## Running the Application

Run both the frontend and backend concurrently:
```
npm run dev
```

This will start:
- React frontend on http://localhost:3000
- Express backend on http://localhost:5000

## Usage

1. Enter a YouTube video URL in the input field
2. Click "Generate Transcript" button
3. Wait for the audio to be downloaded and transcribed
4. View the video and transcript with synchronized highlighting
5. Download the transcript as a text file if needed

## Technologies Used

- Frontend: React, Tailwind CSS, TypeScript
- Backend: Express.js, Node.js
- APIs: AssemblyAI
- Tools: yt-dlp (for YouTube audio extraction)

## Note

This application requires an internet connection and a valid AssemblyAI API key to function properly. The transcription process may take some time depending on the length of the video and your internet connection speed.
