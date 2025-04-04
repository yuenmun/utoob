import axios from 'axios';

interface TranscribeRequest {
  videoId: string;
}

// Set up API service with default configuration
const apiService = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const transcribeVideo = async (data: TranscribeRequest) => {
  try {
    const response = await apiService.post('/transcribe', data);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error('Failed to transcribe video. Please try again.');
    }
  }
};

export default apiService; 