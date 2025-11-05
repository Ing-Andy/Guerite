"use client"

import { useState, useEffect } from "react"
import { Settings, Users, Car, Package, Wifi, WifiOff, RefreshCw, AlertTriangle, BarChart3, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWebSocket } from "../hooks/useWebSocket"
import { useCameraData } from "../hooks/useCameraData"

const recentEvents = [
  {
    id: 1,
    time: "14:32",
    event: "Personne détectée - Zone d'entrée",
    severity: "info" as const,
    camera: "Camera 1",
  },
  {
    id: 2,
    time: "14:28",
    event: "Véhicule non autorisé - Parking",
    severity: "warning" as const,
    camera: "Camera 2",
  },
  {
    id: 3,
    time: "14:25",
    event: "Mouvement suspect détecté",
    severity: "alert" as const,
    camera: "Camera 1",
  },
  {
    id: 4,
    time: "14:20",
    event: "Accès autorisé - Badge scanné",
    severity: "success" as const,
    camera: "Camera 3",
  },
]

export default function PrecisionDashboard() {
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [currentTime, setCurrentTime] = useState(new Date())

  // WebSocket hook
  const { data: wsData, isConnected, error: wsError, reconnect } = useWebSocket("ws://127.0.0.1:8000/ws/counts-list")

  // Camera data hook
  const { cameras, currentCameraData, currentImageUrl, defaultCamera, totalData } = useCameraData(
    wsData,
    selectedCamera,
  )

  // Définir la caméra par défaut
  useEffect(() => {
    if (defaultCamera && !selectedCamera) {
      setSelectedCamera(defaultCamera)
    }
  }, [defaultCamera, selectedCamera])

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Gestion du changement de caméra
  const handleCameraChange = (cameraLabel: string) => {
    setSelectedCamera(cameraLabel)
  }

  // Fonction pour obtenir l'icône selon le type de détection
  const getDetectionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "personne":
        return <Users className="w-4 h-4 text-blue-400" />
      case "vehicule":
        return <Car className="w-4 h-4 text-green-400" />
      case "boxes":
        return <Package className="w-4 h-4 text-yellow-400" />
      default:
        return <Settings className="w-4 h-4 text-gray-400" />
    }
  }

  // Fonction pour obtenir la couleur du badge selon la sévérité
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "alert":
        return "border-red-500 text-red-400 bg-red-500/10"
      case "warning":
        return "border-yellow-500 text-yellow-400 bg-yellow-500/10"
      case "success":
        return "border-green-500 text-green-400 bg-green-500/10"
      default:
        return "border-blue-500 text-blue-400 bg-blue-500/10"
    }
  }

  return (
    <div className="h-screen bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-4 pt-2">
        <div className="flex items-center justify-between flex-wrap p-6 border border-slate-800 bg-slate-900/50 backdrop-blur-sm rounded-2xl">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-white hover:bg-slate-800" />
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Surveillance</h1>
              <p className="text-slate-400">Analyse en temps réel avec IA</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-end">
            {/* Status de connexion */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge className="bg-green-600 text-white flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  LIVE - {currentTime.toLocaleTimeString()}
                </Badge>
              ) : (
                <Badge className="bg-red-600 text-white flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  DÉCONNECTÉ
                </Badge>
              )}

              {wsError && (
                <Button
                  onClick={reconnect}
                  size="sm"
                  variant="outline"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reconnecter
                </Button>
              )}
            </div>

            {/* Sélecteur de caméra */}
            <Select value={selectedCamera} onValueChange={handleCameraChange}>
              <SelectTrigger className="w-64 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Sélectionner une caméra" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {cameras.map((camera, index) => (
                  <SelectItem key={index} value={camera.label} className="text-white hover:bg-slate-700">
                    {camera.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-2 h-[calc(100vh-120px)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Video Feed */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-900/50 border-slate-800 h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    {isConnected ? (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                    )}
                    {selectedCamera || "Aucune caméra sélectionnée"}
                  </CardTitle>

                  {wsData && (
                    <Badge variant="outline" className="text-slate-300">
                      Dernière mise à jour: {new Date(wsData.ts).toLocaleTimeString()}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="h-[calc(100%-80px)]">
                <div className="relative h-full">
                  {currentImageUrl ? (
                    <img
                      src={currentImageUrl || "/placeholder.svg"}
                      alt="Live camera feed"
                      className="w-full h-full object-cover rounded-lg bg-slate-800"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=400&width=600&text=Caméra+Indisponible"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
                      <div className="text-center text-slate-400">
                        <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Aucun flux vidéo disponible</p>
                      </div>
                    </div>
                  )}

                  {/* Overlay avec informations en temps réel */}
                  {currentCameraData && (
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center gap-4 text-white text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span>{currentCameraData.personne}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Car className="w-4 h-4 text-green-400" />
                          <span>{currentCameraData.vehicule}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-yellow-400" />
                          <span>{currentCameraData.boxes}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Panel */}
          <div className="space-y-4 overflow-y-auto">
            {/* Détections IA pour la caméra sélectionnée */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  Détections IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentCameraData ? (
                  <div className="space-y-3">
                    {Object.entries(currentCameraData)
                      .filter(([key]) => key !== "name")
                      .map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getDetectionIcon(type)}
                            <span className="text-white capitalize">{type}</span>
                          </div>
                          <Badge variant="outline" className="text-white">
                            {count}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-8">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune donnée disponible</p>
                    {!isConnected && <p className="text-sm">Vérifiez la connexion WebSocket</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Totaux globaux */}
            {totalData && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Totaux Globaux
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(totalData).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getDetectionIcon(type)}
                        <span className="text-white capitalize text-sm">{type}</span>
                      </div>
                      <Badge variant="outline" className="text-purple-300">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Événements récents */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Événements Récents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg bg-slate-800/50 border-l-2 border-slate-600">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-white mb-1">{event.event}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{event.time}</span>
                          <span>•</span>
                          <span>{event.camera}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Error Toast */}
      {wsError && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Erreur WebSocket</p>
            <p className="text-sm opacity-90">{wsError}</p>
          </div>
          <Button
            onClick={reconnect}
            size="sm"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
