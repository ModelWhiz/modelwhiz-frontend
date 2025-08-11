// modelwhiz-frontend/src/lib/apiClient.ts
import axios from 'axios'
// --- vvv THIS IS THE CHANGE vvv ---
// Import the standalone toast we created
import { toast } from '@/contexts/ChakraProvider'
// --- ^^^ THIS IS THE CHANGE ^^^ ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// This interceptor will handle API errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';
    
    // --- vvv THIS IS THE CHANGE vvv ---
    // Replace the ugly alert() with our beautiful global toast
    toast({
      title: 'An Error Occurred',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    })
    // --- ^^^ THIS IS THE CHANGE ^^^ ---

    return Promise.reject(error);
  }
);

interface StartEvaluationPayload {
  modelFile: File;
  datasetFile: File;
  modelName: string;
  targetColumn: string;
  userId: string;
  preprocessorFile?: File | null;
}

export default apiClient

export const startEvaluation = async (payload: StartEvaluationPayload) => {
  const formData = new FormData();
  formData.append('model_file', payload.modelFile);
  formData.append('dataset', payload.datasetFile);
  formData.append('model_name', payload.modelName);
  formData.append('target_column', payload.targetColumn);
  formData.append('user_id', payload.userId);
  
  if (payload.preprocessorFile) {
    formData.append('preprocessor_file', payload.preprocessorFile);
  }

  const response = await apiClient.post('/evaluations/start', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getJobStatus = async (jobId: number) => {
  const response = await apiClient.get(`/evaluations/${jobId}/status`);
  return response.data;
};

export const getJobResults = async (jobId: number) => {
  const response = await apiClient.get(`/evaluations/${jobId}/results`);
  return response.data;
};