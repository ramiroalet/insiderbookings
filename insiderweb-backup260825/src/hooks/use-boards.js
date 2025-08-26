"use client"
import { useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL

export const useBoards = (access = "2") => {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_URL}/tgx/boards?access=${access}&fetchAll=true`)
        if (!response.ok) {
          throw new Error(`Failed to fetch boards: ${response.status}`)
        }
        const data = await response.json()
        console.log("Boards fetched:", data.boards)
        setBoards(data.boards || [])
      } catch (err) {
        console.error("Error fetching boards:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (access) {
      fetchBoards()
    }
  }, [access])

  const getBoardText = (board, language = "en") => {
    if (!board.texts || board.texts.length === 0) {
      return board.boardCode
    }
    const text = board.texts.find((t) => t.language === language)
    return text?.text || board.texts[0]?.text || board.boardCode
  }

  return {
    boards,
    loading,
    error,
    getBoardText,
  }
}
