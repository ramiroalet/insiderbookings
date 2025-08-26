"use client"
import { useState, useEffect, useRef, useMemo } from "react"

const API_URL = import.meta.env.VITE_API_URL

export const useCategories = (access = "2") => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Evita volver a pedir la misma 'access' más de una vez
  const fetchedFor = useRef(null)

  useEffect(() => {
    // Si no hay access o ya la pedimos, salimos
    if (!access || fetchedFor.current === access) return
    fetchedFor.current = access

    const controller = new AbortController()
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_URL}/tgx/categories?access=${access}&fetchAll=true`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const { categories = [] } = await res.json()
        console.log("Categories fetched:", categories)
        setCategories(categories)
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Categories fetch error:", e)
          setError(e.message)
        }
      } finally {
        setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [access])

  // Memo para no crear un nuevo array en cada render
  const starCategories = useMemo(
    () => categories.filter((c) => ["1", "2", "3", "4", "5"].includes(c.categoryCode)),
    [categories],
  )

  const categoryNames = {
    1: "1 Star",
    2: "2 Stars",
    3: "3 Stars",
    4: "4 Stars",
    5: "5 Stars",
  }

  const getCategoryDisplayName = (code) => categoryNames[code] ?? `Category ${code}`

  const getCategoryText = (category, language = "en") => {
    const t = category.texts?.find((x) => x.language === language)
    return t?.text ?? category.texts?.[0]?.text ?? getCategoryDisplayName(category.categoryCode)
  }

  return {
    categories,
    starCategories,
    loading,
    error,
    getCategoryText,
    getCategoryDisplayName,
  }
}
