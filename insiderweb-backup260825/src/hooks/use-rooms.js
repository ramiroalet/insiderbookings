"use client"
import { useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL

export const useRooms = (access = "2") => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_URL}/tgx/rooms?access=${access}&fetchAll=true`)
        if (!response.ok) {
          throw new Error(`Failed to fetch rooms: ${response.status}`)
        }
        const data = await response.json()
        console.log("Rooms fetched:", data.rooms)
        setRooms(data.rooms || [])
      } catch (err) {
        console.error("Error fetching rooms:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (access) {
      fetchRooms()
    }
  }, [access])

  const getRoomText = (room, language = "en") => {
    if (!room.texts || room.texts.length === 0) {
      return room.roomCode
    }
    const text = room.texts.find((t) => t.language === language)
    return text?.text || room.texts[0]?.text || room.roomCode
  }

  return {
    rooms,
    loading,
    error,
    getRoomText,
  }
}
