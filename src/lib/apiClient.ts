import axios from 'axios'

// ✅ Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

export default apiClient

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

    await axios.put(`${API_BASE_URL}/models/${modelId}/metrics`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    await axios.post(`${API_BASE_URL}/metrics/log`, {
      model_id: modelId,
      accuracy: metrics.accuracy,
      f1_score: metrics.f1_score,
      auc: metrics.auc
    })

    return { message: "✅ Metrics updated and logged to history" }
  } catch (error) {
    console.error('❌ Failed to update and log model metrics:', error)
    throw error
  }
}
