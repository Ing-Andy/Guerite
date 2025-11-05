// ============================================
// LISTE DES VISITEURS AVEC HISTORIQUE
// ============================================
// Affiche tous les visiteurs avec leur historique de visites
// Permet l'export en PDF

"use client"

import { useEffect, useState } from "react"
import type { Visitor, Visit } from "@/lib/types"
import { getAllVisitors, getAllVisits, deleteVisitor } from "@/lib/db"
import { Download, Trash2, History, ChevronDown, ChevronUp, Users } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function VisitorList() {
  // États
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  /**
   * Charge les visiteurs et visites au montage du composant
   */
  const loadData = async () => {
    try {
      console.log("[v0] Chargement des données...")
      const [visitorsData, visitsData] = await Promise.all([getAllVisitors(), getAllVisits()])

      console.log("[v0] Visiteurs chargés:", visitorsData.length)
      console.log("[v0] Visites chargées:", visitsData.length)

      setVisitors(visitorsData)
      setVisits(visitsData)
    } catch (error) {
      console.error("[v0] Erreur chargement:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  /**
   * Récupère les visites d'un visiteur spécifique
   */
  const getVisitorVisits = (numeroCNI: string): Visit[] => {
    return visits
      .filter((v) => v.numeroCNI === numeroCNI)
      .sort((a, b) => {
        const dateA = new Date(`${a.dateVisite} ${a.heureEntree}`)
        const dateB = new Date(`${b.dateVisite} ${b.heureEntree}`)
        return dateB.getTime() - dateA.getTime()
      })
  }

  /**
   * Toggle l'affichage de l'historique d'un visiteur
   */
  const toggleHistory = (visitorId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(visitorId)) {
      newExpanded.delete(visitorId)
    } else {
      newExpanded.add(visitorId)
    }
    setExpandedRows(newExpanded)
  }

  /**
   * Supprime un visiteur et toutes ses visites
   */
  const handleDelete = async (id: number, nom: string, prenoms: string) => {
    if (confirm(`Supprimer ${nom} ${prenoms} et tout son historique ?`)) {
      try {
        console.log("[v0] Suppression visiteur ID:", id)
        await deleteVisitor(id)
        await loadData()
        alert("Visiteur supprimé avec succès")
      } catch (error) {
        console.error("[v0] Erreur suppression:", error)
        alert("Erreur lors de la suppression")
      }
    }
  }

  /**
   * Génère et télécharge le PDF avec tous les visiteurs et leur historique
   */
  const exportToPDF = () => {
    console.log("[v0] Génération du PDF...")

    // Crée un nouveau document PDF (format A4, orientation paysage)
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

    // En-tête du document
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("GUERITE AI - Registre des Visiteurs", 14, 15)

    // Date de génération
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const now = new Date()
    doc.text(`Généré le ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR")}`, 14, 22)

    // Statistiques
    doc.text(`Total visiteurs: ${visitors.length} | Total visites: ${visits.length}`, 14, 28)

    // Prépare les données pour le tableau
    const tableData: any[] = []

    visitors.forEach((visitor) => {
      const visitorVisits = getVisitorVisits(visitor.numeroCNI)

      // Ligne principale du visiteur
      tableData.push([
        visitor.nom,
        visitor.prenoms,
        visitor.dateNaissance,
        visitor.lieuNaissance,
        visitor.numeroCNI,
        visitor.profession,
        visitorVisits.length.toString(),
        visitorVisits[0]?.dateVisite || "-",
      ])

      // Ajoute les visites en sous-lignes
      visitorVisits.forEach((visit, index) => {
        tableData.push([
          "",
          `  └ Visite #${visitorVisits.length - index}`,
          visit.dateVisite,
          visit.heureEntree,
          visit.heureSortie || "En cours",
          "",
          "",
          "",
        ])
      })
    })

    // Génère le tableau avec autoTable
    autoTable(doc, {
      startY: 35,
      head: [
        [
          "Nom",
          "Prénom(s)",
          "Date naissance",
          "Lieu naissance",
          "N° CNI",
          "Profession",
          "Nb visites",
          "Dernière visite",
        ],
      ],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [37, 99, 235], // Bleu
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Gris clair
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 20 },
        7: { cellWidth: 25 },
      },
    })

    // Télécharge le PDF
    const filename = `guerite_ai_${now.toISOString().split("T")[0]}.pdf`
    doc.save(filename)
    console.log("[v0] PDF généré:", filename)
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Liste des visiteurs ({visitors.length})
        </h2>

        {/* Bouton export PDF */}
        <button
          onClick={exportToPDF}
          disabled={visitors.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2 font-medium"
        >
          <Download className="w-5 h-5" />
          Télécharger PDF
        </button>
      </div>

      {/* Message si vide */}
      {visitors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun visiteur enregistré</p>
          <p className="text-gray-400 text-sm mt-2">Utilisez le scanner ou le formulaire pour ajouter des visiteurs</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">Nom</th>
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">Prénom(s)</th>
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">Date naissance</th>
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">N° CNI</th>
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">Profession</th>
                <th className="border px-4 py-3 text-center font-semibold text-gray-700">Visites</th>
                <th className="border px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => {
                const visitorVisits = getVisitorVisits(visitor.numeroCNI)
                const isExpanded = expandedRows.has(visitor.id!)

                return (
                  <>
                    {/* Ligne principale du visiteur */}
                    <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="border px-4 py-3 font-medium">{visitor.nom}</td>
                      <td className="border px-4 py-3">{visitor.prenoms}</td>
                      <td className="border px-4 py-3 text-sm">{visitor.dateNaissance}</td>
                      <td className="border px-4 py-3 text-sm font-mono">{visitor.numeroCNI}</td>
                      <td className="border px-4 py-3 text-sm">{visitor.profession}</td>
                      <td className="border px-4 py-3 text-center">
                        <button
                          onClick={() => toggleHistory(visitor.id!)}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          <History className="w-4 h-4" />
                          {visitorVisits.length}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="border px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(visitor.id!, visitor.nom, visitor.prenoms)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm font-medium inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </td>
                    </tr>

                    {/* Historique des visites (dropdown) */}
                    {isExpanded && visitorVisits.length > 0 && (
                      <tr>
                        <td colSpan={7} className="border px-4 py-3 bg-blue-50">
                          <div className="space-y-2">
                            <p className="font-semibold text-blue-900 mb-3">
                              Historique des visites ({visitorVisits.length})
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {visitorVisits.map((visit, index) => (
                                <div
                                  key={visit.id || index}
                                  className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-blue-900">
                                      Visite #{visitorVisits.length - index}
                                    </span>
                                    {index === 0 && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                        Dernière
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm space-y-1 text-gray-700">
                                    <p>
                                      <span className="font-medium">Date:</span> {visit.dateVisite}
                                    </p>
                                    <p>
                                      <span className="font-medium">Entrée:</span> {visit.heureEntree}
                                    </p>
                                    {visit.heureSortie && (
                                      <p>
                                        <span className="font-medium">Sortie:</span> {visit.heureSortie}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
