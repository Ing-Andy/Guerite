// ============================================
// FORMULAIRE D'ENREGISTREMENT DES VISITEURS
// ============================================
// Permet la saisie manuelle ou l'édition des données scannées
// Détecte automatiquement les doublons et affiche l'historique

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Visitor, Visit } from "@/lib/types"
import { addVisitor, addVisit, checkExistingVisitor, getVisitsByNumeroCNI } from "@/lib/db"
import { UserPlus, AlertCircle, History, ChevronDown, ChevronUp } from "lucide-react"

interface Props {
  onVisitorAdded: () => void // Callback après ajout réussi
  initialData?: Partial<Visitor> // Données pré-remplies depuis le scan
}

export default function VisitorForm({ onVisitorAdded, initialData }: Props) {
  // État du formulaire
  const [formData, setFormData] = useState<Omit<Visitor, "id">>({
    nom: "",
    prenoms: "",
    dateNaissance: "",
    lieuNaissance: "",
    numeroCNI: "",
    profession: "",
  })

  // États pour la détection de doublons
  const [existingVisitor, setExistingVisitor] = useState<Visitor | null>(null)
  const [visitHistory, setVisitHistory] = useState<Visit[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(false)

  /**
   * Met à jour le formulaire quand des données sont scannées
   */
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }))

      // Vérifie si le visiteur existe déjà
      if (initialData.numeroCNI) {
        checkForDuplicate(initialData.numeroCNI)
      }
    }
  }, [initialData])

  /**
   * Vérifie si un visiteur avec ce numéro CNI existe déjà
   * Si oui, charge son historique de visites
   */
  const checkForDuplicate = async (numeroCNI: string) => {
    if (!numeroCNI || numeroCNI.length < 8) return

    try {
      console.log("[v0] Vérification doublon pour CNI:", numeroCNI)

      // Recherche dans la base de données
      const existing = await checkExistingVisitor(numeroCNI)

      if (existing) {
        console.log("[v0] Visiteur existant trouvé:", existing)
        setExistingVisitor(existing)

        // Charge l'historique des visites
        const history = await getVisitsByNumeroCNI(numeroCNI)
        console.log("[v0] Historique chargé:", history.length, "visites")
        setVisitHistory(history)
        setShowHistory(true)
      } else {
        console.log("[v0] Nouveau visiteur")
        setExistingVisitor(null)
        setVisitHistory([])
        setShowHistory(false)
      }
    } catch (error) {
      console.error("[v0] Erreur vérification doublon:", error)
    }
  }

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Vérifie les doublons quand le numéro CNI change
    if (name === "numeroCNI" && value.length >= 8) {
      checkForDuplicate(value)
    }
  }

  /**
   * Soumet le formulaire et enregistre la visite
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const now = new Date()
      let visitorId: number

      // Si le visiteur existe déjà, on utilise son ID
      if (existingVisitor) {
        console.log("[v0] Enregistrement nouvelle visite pour visiteur existant")
        visitorId = existingVisitor.id!
      } else {
        // Sinon, on crée un nouveau visiteur
        console.log("[v0] Création nouveau visiteur")
        visitorId = await addVisitor(formData)
      }

      // Enregistre la nouvelle visite
      const visit: Visit = {
        visitorId,
        numeroCNI: formData.numeroCNI,
        dateVisite: now.toISOString().split("T")[0],
        heureEntree: now.toLocaleTimeString("fr-FR"),
        motif: "",
        notes: "",
      }

      await addVisit(visit)
      console.log("[v0] Visite enregistrée avec succès")

      // Réinitialise le formulaire
      setFormData({
        nom: "",
        prenoms: "",
        dateNaissance: "",
        lieuNaissance: "",
        numeroCNI: "",
        profession: "",
      })
      setExistingVisitor(null)
      setVisitHistory([])
      setShowHistory(false)

      onVisitorAdded()
      alert("Visite enregistrée avec succès!")
    } catch (error) {
      console.error("[v0] Erreur enregistrement:", error)
      alert("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      {/* En-tête */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <UserPlus className="w-6 h-6" />
        Enregistrement visiteur
      </h2>

      {/* Alerte si données scannées */}
      {initialData && Object.keys(initialData).length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Données extraites du scan. Vérifiez et corrigez si nécessaire.</p>
        </div>
      )}

      {/* Alerte si visiteur existant détecté */}
      {existingVisitor && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-yellow-800">Visiteur déjà enregistré!</p>
              <p className="text-sm text-yellow-700 mt-1">
                {existingVisitor.nom} {existingVisitor.prenoms} a déjà {visitHistory.length} visite(s) enregistrée(s).
              </p>
            </div>
          </div>

          {/* Bouton pour afficher/masquer l'historique */}
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="mt-2 flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-800 font-medium"
          >
            <History className="w-4 h-4" />
            {showHistory ? "Masquer" : "Afficher"} l'historique
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Dropdown de l'historique */}
          {showHistory && visitHistory.length > 0 && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {visitHistory.map((visit, index) => (
                <div key={visit.id || index} className="p-3 bg-white border border-yellow-200 rounded text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">Visite #{visitHistory.length - index}</p>
                      <p className="text-gray-600 text-xs mt-1">
                        {visit.dateVisite} à {visit.heureEntree}
                      </p>
                      {visit.heureSortie && <p className="text-gray-600 text-xs">Sortie: {visit.heureSortie}</p>}
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {index === 0 ? "Dernière" : `Il y a ${index + 1}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom de famille"
            />
          </div>

          {/* Prénoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom(s) *</label>
            <input
              type="text"
              name="prenoms"
              value={formData.prenoms}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Prénom(s)"
            />
          </div>

          {/* Date de naissance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Lieu de naissance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance *</label>
            <input
              type="text"
              name="lieuNaissance"
              value={formData.lieuNaissance}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ville, Pays"
            />
          </div>

          {/* Numéro CNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro CNI *</label>
            <input
              type="text"
              name="numeroCNI"
              value={formData.numeroCNI}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 123456789"
            />
          </div>

          {/* Profession */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession *</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Métier"
            />
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              {existingVisitor ? "Enregistrer nouvelle visite" : "Enregistrer visiteur"}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
