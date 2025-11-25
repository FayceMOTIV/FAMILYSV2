import { useState, useEffect } from 'react'
import { productsAPI } from '../services/api'

export const useProducts = (categoryId = null) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = categoryId ? { category: categoryId } : {}
      const response = await productsAPI.getAll(params)
      setProducts(response.data)
      console.log(`✅ Fetched ${response.data.length} products`)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erreur de chargement des produits'
      setError(errorMsg)
      console.error('❌ Error fetching products:', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [categoryId])

  return { products, loading, error, refetch: fetchProducts }
}

export const useProduct = (productId) => {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProduct = async () => {
    if (!productId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await productsAPI.getById(productId)
      setProduct(response.data)
      console.log('✅ Product fetched:', response.data.name)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erreur de chargement du produit'
      setError(errorMsg)
      console.error('❌ Error fetching product:', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [productId])

  return { product, loading, error, refetch: fetchProduct }
}
