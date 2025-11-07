"use client"

import { useState } from "react"
import CameraScanner from "@/components/camera-scanner"
import VisitorForm from "@/components/visitor-form"
import VisitorList from "@/components/visitor-list"
import { Shield, Camera, FileText, List } from "lucide-react"

export default function GueriteAI() {
  const [scannedData, setScannedData] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeMode, setActiveMode] = useState<"scanner" | "form">("scanner")

  const handleDataExtracted = (data: any) => {
    console.log("[v0] Données extraites du scan:", data)
    setScannedData(data)
    setActiveMode("form")
  }

  const handleVisitorAdded = () => {
    console.log("[v0] Visiteur ajouté, rechargement de la liste")
    setRefreshKey((k) => k + 1)
    setScannedData({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Guerite AI</h1>
                <p className="text-sm text-gray-600">Système de gestion autonome des visiteurs</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Système opérationnel</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                <button
                  onClick={() => setActiveMode("scanner")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeMode === "scanner"
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  Option 1: Scan automatique CNI
                </button>
                <button
                  onClick={() => setActiveMode("form")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeMode === "form"
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  Option 2: Saisie manuelle
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeMode === "scanner" ? (
                <CameraScanner onDataExtracted={handleDataExtracted} />
              ) : (
                <VisitorForm initialData={scannedData} onVisitorAdded={handleVisitorAdded} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <List className="w-6 h-6" />
                Registre des visiteurs
              </h2>
            </div>
            <div className="p-6">
              <div key={refreshKey}>
                <VisitorList />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 text-lg">Fonctionnalités du système:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Scan automatique:</strong> Extraction automatique des données depuis la CNI via OCR
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Saisie manuelle:</strong> Formulaire de secours pour entrée manuelle des données
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Photos CNI:</strong> Capture automatique du recto et verso de la CNI
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Détection de doublons:</strong> Identification automatique des visiteurs déjà enregistrés
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Historique des visites:</strong> Dropdown affichant toutes les visites précédentes d'un
                  visiteur
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>100% autonome:</strong> Fonctionne sans connexion internet, données stockées localement
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium">Guerite AI - Système de gestion autonome</p>
            <p className="mt-1">Toutes les données sont stockées localement sur cet appareil</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
