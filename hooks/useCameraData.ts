"use client"

import { useState, useEffect, useMemo } from "react"

interface Camera {
  label: string
  streamUrl: string
}

interface Per {
  name: string
  vehicule: number
  personne: number
  boxes: number
}

interface DataStrict {
  ts: string
  per_camera: Per[]
  totals: {
    vehicule: number
    personne: number
    boxes: number
  }
}

export const useCameraData = (wsData: DataStrict | null, selectedCamera: string) => {
  const [cameras, setCameras] = useState<Camera[]>([])

  // Charger les caméras depuis localStorage
  useEffect(() => {
    const data = localStorage.getItem("listeData")
    if (data) {
      try {
        const parsed = JSON.parse(data)
        setCameras(parsed)
      } catch (err) {
        console.error("Erreur parsing localStorage:", err)
      }
    }
  }, [])

  // Données filtrées pour la caméra sélectionnée
  const currentCameraData = useMemo(() => {
    if (!wsData?.per_camera || !selectedCamera) return null

    return wsData.per_camera.find((item) => item.name === selectedCamera) || null
  }, [wsData, selectedCamera])

  // URL de l'image pour la caméra sélectionnée
  const currentImageUrl = useMemo(() => {
    if (!cameras.length || !selectedCamera) return ""

    const camera = cameras.find((cam) => cam.label === selectedCamera)
    return camera?.streamUrl || ""
  }, [cameras, selectedCamera])

  // Première caméra par défaut
  const defaultCamera = useMemo(() => {
    return cameras.length > 0 ? cameras[0].label : ""
  }, [cameras])

  return {
    cameras,
    currentCameraData,
    currentImageUrl,
    defaultCamera,
    totalData: wsData?.totals || null,
  }
}
