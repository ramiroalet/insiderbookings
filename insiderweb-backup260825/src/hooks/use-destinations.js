"use client"
import { useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL

export const useDestinations = (access = "2", type = null) => {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({
          access,
          fetchAll: "true",
          maxSize: "100", // Limitar para no sobrecargar
        })
        if (type) {
          params.append("type", type)
        }

        const response = await fetch(`${API_URL}/tgx/destinations?${params}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch destinations: ${response.status}`)
        }
        const data = await response.json()
        console.log("Destinations fetched:", data.destinations)
        setDestinations(data.destinations || [])
      } catch (err) {
        console.error("Error fetching destinations:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (access) {
      fetchDestinations()
    }
  }, [access, type])

  // Helper para obtener texto de destino en idioma específico
  const getDestinationText = (destination, language = "en") => {
    if (!destination.texts || destination.texts.length === 0) {
      return destination.code
    }
    const text = destination.texts.find((t) => t.language === language)
    return text?.text || destination.texts[0]?.text || destination.code
  }

  // Filtrar solo ciudades
  const cities = destinations.filter((dest) => dest.type === "CITY")

  // Filtrar solo zonas
  const zones = destinations.filter((dest) => dest.type === "ZONE")

  // Destinos disponibles
  const availableDestinations = destinations.filter((dest) => dest.available)

  return {
    destinations,
    cities,
    zones,
    availableDestinations,
    loading,
    error,
    getDestinationText,
  }
}
