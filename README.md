# YouTube Transcript Generator

A web application that downloads YouTube videos, transcribes them using AssemblyAI, and displays the transcript alongside the video.

## Features

- YouTube video playback
- Video audio extraction
- Transcription using AssemblyAI's API
- Responsive design with Tailwind CSS
- Real-time loading indicators and feedback

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- An AssemblyAI API key (get one at [https://www.assemblyai.com](https://www.assemblyai.com))

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yuenmun/utoob.git
   cd utoob
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create an `.env.local` file in the root directory with your AssemblyAI API key:
   ```
   ASSEMBLY_AI_API_KEY=your_api_key_here
   ```

## Running the Application

### Development Mode

To run both the React frontend and Node.js backend concurrently:

```
npm run dev
```

This will start:
- React development server on port 3000
- Express API server on port 5001

### Run Frontend Only

```
npm start
```

### Run Backend Only

```
npm run server
```

For development with auto-restart:

```
npm run server:dev
```

## How to Use

1. Enter a YouTube URL in the input field
2. Click "Generate Transcript"
3. Wait for the transcription process to complete
4. View the transcript alongside the video

## API Endpoints

- `POST /api/extract-audio`: Extracts audio from a YouTube video
- `POST /api/transcribe`: Sends audio to AssemblyAI for transcription
- `GET /api/transcript/:id`: Retrieves transcription status and results

## Technologies Used

- React
- TypeScript
- Express.js
- Node.js
- Tailwind CSS
- AssemblyAI API
- YouTube Data API

## License

MIT

## Acknowledgements

- [AssemblyAI](https://www.assemblyai.com) for providing the transcription API
- [YouTube Data API](https://developers.google.com/youtube/v3) for video data
