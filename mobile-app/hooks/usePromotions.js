import { useState, useEffect } from 'react'
import { promotionsAPI } from '../services/api'

export const usePromotions = () => {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPromotions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await promotionsAPI.getActive()
      setPromotions(response.data)
      console.log(`✅ Fetched ${response.data.length} active promotions`)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erreur de chargement des promotions'
      setError(errorMsg)
      console.error('❌ Error fetching promotions:', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  return { promotions, loading, error, refetch: fetchPromotions }
}
