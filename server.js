const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Assembly AI API key
const ASSEMBLYAI_API_KEY = process.env.REACT_APP_ASSEMBLYAI_API_KEY;
if (!ASSEMBLYAI_API_KEY) {
  console.error('AssemblyAI API key is not set. Please set REACT_APP_ASSEMBLYAI_API_KEY in .env.local');
  process.exit(1);
}

console.log('Using AssemblyAI API key:', ASSEMBLYAI_API_KEY);

// Configure AssemblyAI API client
const assemblyai = axios.create({
  baseURL: 'https://api.assemblyai.com/v2',
  headers: {
    'authorization': ASSEMBLYAI_API_KEY,
    'Content-Type': 'application/json',
  },
});

// Download YouTube audio
const downloadYouTubeAudio = (videoId) => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(tempDir, `${videoId}.m4a`);
    
    console.log(`Downloading audio for video ID: ${videoId}`);
    console.log(`Output path: ${outputPath}`);
    
    // Use yt-dlp to download audio only - format matches documentation recommendation
    const command = `yt-dlp -f m4a/bestaudio/best -o "${outputPath}" https://www.youtube.com/watch?v=${videoId}`;
    console.log(`Executing command: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error downloading YouTube audio: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return reject(new Error('Failed to download YouTube audio'));
      }
      
      console.log(`Download stdout: ${stdout}`);
      
      if (!fs.existsSync(outputPath)) {
        console.error(`Downloaded file does not exist at: ${outputPath}`);
        return reject(new Error('Downloaded file not found'));
      }
      
      console.log(`Audio file downloaded successfully to: ${outputPath}`);
      resolve(outputPath);
    });
  });
};

// Upload file to AssemblyAI
const uploadFileToAssemblyAI = async (filePath) => {
  try {
    console.log(`Reading file at: ${filePath}`);
    const fileData = fs.readFileSync(filePath);
    console.log(`File size: ${fileData.length} bytes`);
    
    console.log('Uploading file to AssemblyAI...');
    const response = await axios({
      method: 'post',
      url: 'https://api.assemblyai.com/v2/upload',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      data: fileData
    });
    
    console.log('File uploaded successfully. Upload URL:', response.data.upload_url);
    return response.data.upload_url;
  } catch (error) {
    console.error('Error uploading file to AssemblyAI:', error.message);
    if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
    }
    throw new Error('Failed to upload file to AssemblyAI');
  }
};

// Transcribe audio with AssemblyAI
const transcribeAudio = async (audioUrl) => {
  try {
    console.log('Starting transcription job for:', audioUrl);
    
    // Create new transcription request with proper format
    const transcriptionOptions = {
      audio_url: audioUrl
    };
    
    console.log('Sending transcription options:', JSON.stringify(transcriptionOptions, null, 2));
    
    // Start transcription job
    const response = await assemblyai.post('/transcript', transcriptionOptions);
    
    const transcriptId = response.data.id;
    console.log('Transcription job started with ID:', transcriptId);
    
    // Poll for transcription completion
    let transcriptData = null;
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes (10 sec * 60)
    
    while (attempts < maxAttempts) {
      console.log(`Polling for results (attempt ${attempts + 1})...`);
      const pollingResponse = await assemblyai.get(`/transcript/${transcriptId}`);
      const { status } = pollingResponse.data;
      console.log(`Current status: ${status}`);
      
      if (status === 'completed') {
        transcriptData = pollingResponse.data;
        console.log('Transcription completed successfully');
        break;
      } else if (status === 'error') {
        console.error('Transcription failed with error:', pollingResponse.data.error);
        throw new Error(`Transcription failed: ${pollingResponse.data.error}`);
      }
      
      attempts++;
      console.log('Waiting 10 seconds before polling again...');
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds before polling again
    }
    
    if (!transcriptData) {
      console.error('Transcription timed out after maximum attempts');
      throw new Error('Transcription timed out');
    }
    
    return transcriptData;
  } catch (error) {
    console.error('Error transcribing audio:', error.message);
    if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
    }
    throw new Error('Failed to transcribe audio');
  }
};

// Transcribe YouTube video endpoint
app.post('/api/transcribe', async (req, res) => {
  console.log('Received transcription request:', req.body);
  const { videoId } = req.body;
  
  if (!videoId) {
    console.error('No videoId provided in request');
    return res.status(400).json({ error: 'Video ID is required' });
  }
  
  console.log(`Processing transcription for video ID: ${videoId}`);
  
  try {
    let audioFilePath = null;
    
    try {
      // Download YouTube video audio
      audioFilePath = await downloadYouTubeAudio(videoId);
      
      // Upload audio to AssemblyAI
      const uploadUrl = await uploadFileToAssemblyAI(audioFilePath);
      
      // Transcribe audio
      const transcriptData = await transcribeAudio(uploadUrl);
      
      // Extract words with timestamps
      console.log('Processing transcript data...');
      
      // Check if AssemblyAI returned data in expected format
      if (!transcriptData.words || !Array.isArray(transcriptData.words)) {
        console.error('Invalid transcript data - missing words array:', JSON.stringify(transcriptData, null, 2));
        // Try to handle alternate data structure if possible
        if (transcriptData.utterances && Array.isArray(transcriptData.utterances)) {
          console.log('Found utterances data, using that instead');
          const words = [];
          transcriptData.utterances.forEach(utterance => {
            if (utterance.words && Array.isArray(utterance.words)) {
              utterance.words.forEach(word => {
                words.push({
                  word: word.text || word.word,
                  start: (word.start || 0) / 1000,
                  end: (word.end || 0) / 1000
                });
              });
            }
          });
          if (words.length > 0) {
            console.log(`Processed ${words.length} words from utterances`);
            return res.json({
              videoId,
              words,
            });
          }
        }
        
        // If we couldn't find words data in any format
        return res.status(500).json({ error: 'Invalid transcript data received from AssemblyAI' });
      }
      
      // Standard format processing
      const words = transcriptData.words.map(word => ({
        word: word.text || word.word,
        start: (word.start || 0) / 1000, // Convert to seconds
        end: (word.end || 0) / 1000, // Convert to seconds
      }));
      
      console.log(`Processed ${words.length} words from transcript`);
      
      // Return transcript data
      return res.json({
        videoId,
        words,
      });
    } finally {
      // Clean up temp file
      if (audioFilePath && fs.existsSync(audioFilePath)) {
        console.log(`Cleaning up temporary file: ${audioFilePath}`);
        fs.unlinkSync(audioFilePath);
      }
    }
  } catch (error) {
    console.error('Error processing transcription request:', error);
    return res.status(500).json({ error: error.message || 'Failed to process transcription' });
  }
});

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Temp directory: ${tempDir}`);
}); 