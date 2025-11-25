import { useState, useEffect } from 'react'
import { categoriesAPI } from '../services/api'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.data)
      console.log(`✅ Fetched ${response.data.length} categories`)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erreur de chargement des catégories'
      setError(errorMsg)
      console.error('❌ Error fetching categories:', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return { categories, loading, error, refetch: fetchCategories }
}
