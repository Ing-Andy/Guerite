"use client";

import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "./ui/button";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import type { Visitor, Visit } from "@/lib/types";
import { getAllVisitors, getAllVisits, deleteVisitor } from "@/lib/db";
import { Trash2, History, ChevronDown, ChevronUp, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function VisitorList() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // 📄 Télécharger en PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des visiteurs", 14, 15);

    const tableData = visitors.map((v) => [
      v.id,
      v.nom,
      v.prenoms,
      v.dateNaissance,
      v.lieuNaissance,
      v.phone,
      v.numeroCNI,
      v.profession,
      // new Date(v.date).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [
        [
          "ID",
          "Nom",
          "prenom",
          "date de naissance",
          "lieux de naissance",
          "Téléphone",
          "numero de CNI",
          "pofession",
        ],
      ],
      body: tableData,
      startY: 20,
    });

    doc.save("visitors.pdf");
  };

  // 📊 Télécharger en Excel
  // const downloadExcel = () => {
  //   const worksheetData = visitors.map((v) => ({
  //     ID: v.id,
  //     Nom: v.nom,
  //     Email: v.prenoms,
  //     date_N: v.dateNaissance,
  //     lieux_N: v.lieuNaissance,
  //     Téléphone: v.phone,
  //     numeroCNI: v.numeroCNI,
  //     profession: v.profession,
  //     // Date: new Date(v.date).toLocaleString(),
  //   }));

  //   const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Visiteurs");

  //   const excelBuffer = XLSX.write(workbook, {
  //     bookType: "xlsx",
  //     type: "array",
  //   });
  //   const blob = new Blob([excelBuffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  //   });
  //   saveAs(blob, "visitors.xlsx");
  // };

  // 📊 Télécharger en Excel — version corrigée et optimisée
  const downloadExcel = () => {
    try {
      if (!visitors || visitors.length === 0) {
        alert("❌ Aucun visiteur à exporter !");
        return;
      }

      // 🔹 1. Préparer les données
      const worksheetData = visitors.map((v) => ({
        ID: v.id || "",
        Nom: v.nom || "",
        Prenoms: v.prenoms || "",
        Date_Naissance: v.dateNaissance || "",
        Lieux_Naissance: v.lieuNaissance || "",
        Téléphone: v.phone || "",
        Numero_CNI: v.numeroCNI || "",
        Profession: v.profession || "",
      }));

      // 🔹 2. Nettoyer les lignes vides éventuelles
      const cleanedData = worksheetData.filter(
        (v) => v && Object.keys(v).length > 0
      );

      if (cleanedData.length === 0) {
        alert("❌ Aucune donnée valide trouvée pour l’export Excel !");
        return;
      }

      // 🔹 3. Créer la feuille Excel
      const worksheet = XLSX.utils.json_to_sheet(cleanedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Visiteurs");

      // 🔹 4. Générer le fichier Excel
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      // 🔹 5. Nom de fichier dynamique avec date/heure
      const date = new Date();
      const formattedDate = date
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-");
      const fileName = `visitors_${formattedDate}.xlsx`;

      // 🔹 6. Télécharger le fichier
      saveAs(blob, fileName);

      console.log(`✅ Export Excel réussi : ${fileName}`);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la génération du fichier Excel :",
        error
      );
      alert("Une erreur est survenue lors de la génération du fichier Excel.");
    }
  };

  const loadData = async () => {
    try {
      console.log("[v0] Chargement des données...");
      const [visitorsData, visitsData] = await Promise.all([
        getAllVisitors(),
        getAllVisits(),
      ]);

      console.log("[v0] Visiteurs chargés:", visitorsData.length);
      console.log("[v0] Visites chargées:", visitsData.length);

      setVisitors(visitorsData);
      setVisits(visitsData);
    } catch (error) {
      console.error("[v0] Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const getVisitorVisits = (numeroCNI: string): Visit[] => {
    return visits
      .filter((v) => v.numeroCNI === numeroCNI)
      .sort((a, b) => {
        const dateA = new Date(`${a.dateVisite} ${a.heureEntree}`);
        const dateB = new Date(`${b.dateVisite} ${b.heureEntree}`);
        return dateB.getTime() - dateA.getTime();
      });
  };

  const toggleHistory = (visitorId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(visitorId)) {
      newExpanded.delete(visitorId);
    } else {
      newExpanded.add(visitorId);
    }
    setExpandedRows(newExpanded);
  };

  const handleDelete = async (id: number, nom: string, prenoms: string) => {
    if (confirm(`Supprimer ${nom} ${prenoms} et tout son historique ?`)) {
      try {
        console.log("[v0] Suppression visiteur ID:", id);
        await deleteVisitor(id);
        await loadData();
        alert("Visiteur supprimé avec succès");
      } catch (error) {
        console.error("[v0] Erreur suppression:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Liste des visiteurs ({visitors.length})
        </h2>

        <div className="md:flex gap-3 mb-4 hidden">
          <button
            onClick={() => {
              localStorage.removeItem("excelData");
              // alert("Historique des téléchargements Excel réinitialisé ✅");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Réinitialiser Excel
          </button>

          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Télécharger PDF
          </button>
          <button
            onClick={downloadExcel}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Télécharger Excel
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="md:hidden">
            <Button>options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex gap-2 flex-col">
            <button
              onClick={() => {
                localStorage.removeItem("excelData");
                alert("Historique des téléchargements Excel réinitialisé ✅");
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Réinitialiser Excel
            </button>

            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Télécharger PDF
            </button>

            <button
              onClick={downloadExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Télécharger Excel
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {visitors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun visiteur enregistré</p>
          <p className="text-gray-400 text-sm mt-2">
            Utilisez le scanner ou le formulaire pour ajouter des visiteurs
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                  Nom
                </th>
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                  Prénom(s)
                </th>
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                  Date naissance
                </th>
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                  N° CNI
                </th>
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                  Phone
                </th>
                <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                  Profession
                </th>
                <th className="border px-4 py-3 text-center font-semibold text-gray-700">
                  Visites
                </th>
                <th className="border px-4 py-3 text-center font-semibold text-gray-700">
                  Actions
                </th>
                <th className="border px-4 py-3 text-center font-semibold text-gray-700">
                  Recto CNI
                </th>
                <th className="border px-4 py-3 text-center font-semibold text-gray-700">
                  Verso CNI
                </th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => {
                const visitorVisits = getVisitorVisits(visitor.numeroCNI);
                const isExpanded = expandedRows.has(visitor.id!);

                return (
                  <>
                    <tr
                      key={visitor.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="border px-4 py-3 font-medium">
                        {visitor.nom}
                      </td>
                      <td className="border px-4 py-3">{visitor.prenoms}</td>
                      <td className="border px-4 py-3 text-sm">
                        {visitor.dateNaissance}
                      </td>
                      <td className="border px-4 py-3 text-sm font-mono">
                        {visitor.numeroCNI}
                      </td>
                      <td className="border px-4 py-3 text-sm">
                        {visitor.phone}
                      </td>
                      <td className="border px-4 py-3 text-sm">
                        {visitor.profession}
                      </td>
                      <td className="border px-4 py-3 text-center">
                        <button
                          onClick={() => toggleHistory(visitor.id!)}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          <History className="w-4 h-4" />
                          {visitorVisits.length}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="border px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            handleDelete(
                              visitor.id!,
                              visitor.nom,
                              visitor.prenoms
                            )
                          }
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm font-medium inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </td>
                      <td className="border px-4 py-3 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-blue-600 hover:text-blue-800 underline text-sm">
                              {visitor.photo_recto ? "Voir recto" : "—"}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-bold">
                                CNI Recto
                              </DialogTitle>
                            </DialogHeader>
                            {visitor.photo_recto ? (
                              <div className="mt-4">
                                <img
                                  src={
                                    visitor.photo_recto || "/placeholder.svg"
                                  }
                                  alt="CNI Recto"
                                  className="w-full h-auto rounded-lg shadow-lg"
                                />
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">
                                Aucune photo
                              </p>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                      <td className="border px-4 py-3 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-blue-600 hover:text-blue-800 underline text-sm">
                              {visitor.photo_verso ? "Voir verso" : "—"}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-bold">
                                CNI Verso
                              </DialogTitle>
                            </DialogHeader>
                            {visitor.photo_verso ? (
                              <div className="mt-4">
                                <img
                                  src={
                                    visitor.photo_verso || "/placeholder.svg"
                                  }
                                  alt="CNI Verso"
                                  className="w-full h-auto rounded-lg shadow-lg"
                                />
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">
                                Aucune photo
                              </p>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>

                    {isExpanded && visitorVisits.length > 0 && (
                      <tr>
                        <td colSpan={9} className="border px-4 py-3 bg-blue-50">
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
                                      <span className="font-medium">Date:</span>{" "}
                                      {visit.dateVisite}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Entrée:
                                      </span>{" "}
                                      {visit.heureEntree}
                                    </p>
                                    {visit.heureSortie && (
                                      <p>
                                        <span className="font-medium">
                                          Sortie:
                                        </span>{" "}
                                        {visit.heureSortie}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
