"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface Per {
  name: string
  vehicule: number
  personne: number
  boxes: number
}

interface Counts {
  vehicule: number
  personne: number
  boxes: number
}

interface DataStrict {
  ts: string
  per_camera: Per[]
  totals: Counts
}

interface UseWebSocketReturn {
  data: DataStrict | null
  isConnected: boolean
  error: string | null
  reconnect: () => void
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [data, setData] = useState<DataStrict | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    try {
      // Fermer la connexion existante si elle existe
      if (wsRef.current) {
        wsRef.current.close()
      }

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("✅ WebSocket connecté")
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const parsedData: DataStrict = JSON.parse(event.data)
          setData(parsedData)
        } catch (err) {
          console.error("❌ Erreur parsing WebSocket data:", err)
          setError("Erreur de format des données")
        }
      }

      ws.onerror = (event) => {
        console.error("❌ Erreur WebSocket:", event)
        setError("Erreur de connexion WebSocket")
        setIsConnected(false)
      }

      ws.onclose = (event) => {
        console.log("🔌 WebSocket fermé:", event.code, event.reason)
        setIsConnected(false)

        // Tentative de reconnexion automatique
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000 // Backoff exponentiel
          console.log(`🔄 Tentative de reconnexion dans ${delay}ms...`)

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        } else {
          setError("Impossible de se reconnecter après plusieurs tentatives")
        }
      }
    } catch (err) {
      console.error("❌ Erreur création WebSocket:", err)
      setError("Impossible de créer la connexion WebSocket")
    }
  }, [url])

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    setError(null)
    connect()
  }, [connect])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return { data, isConnected, error, reconnect }
}
