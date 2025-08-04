import axios from 'axios'

// ✅ Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// This interceptor will handle API errors globally
apiClient.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => {
    console.error('API Error:', error);

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';
    
    // Using a simple alert for now, but a global toast would be ideal
    alert(`API Error: ${message}`);

    return Promise.reject(error);
  }
);

export default apiClient

// --------------- FUNCTION UPDATED ---------------
export const updateModelMetrics = async (
  modelId: number,
  metrics: {
    accuracy: number,
    f1_score: number,
    auc: number
  }
) => {
  try {
    const formData = new FormData()
    formData.append('accuracy', metrics.accuracy.toString())
    formData.append('f1_score', metrics.f1_score.toString())
    formData.append('auc', metrics.auc.toString())

    // It's now just ONE API call to our new, consolidated endpoint.
    // We use `apiClient` to ensure the interceptor is used.
    const response = await apiClient.post(`/models/${modelId}/metrics`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return { message: "✅ Metrics updated and logged successfully", data: response.data }
  } catch (error) {
    // The interceptor will show the alert. We just re-throw the error
    // so that component-level logic (like stopping a spinner) can run.
    console.error('❌ Failed to log manual metrics:', error)
    throw error
  }
}
// ----------------------------------------------