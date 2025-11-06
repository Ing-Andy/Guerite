// ============================================
// FORMULAIRE D'ENREGISTREMENT DES VISITEURS
// ============================================
// Permet la saisie manuelle ou l'édition des données scannées
// Détecte automatiquement les doublons et affiche l'historique

"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import type { Visitor, Visit } from "@/lib/types";
import {
  addVisitor,
  addVisit,
  checkExistingVisitor,
  getVisitsByNumeroCNI,
  updateVisitorPhotos,
} from "@/lib/db";
import {
  UserPlus,
  AlertCircle,
  History,
  ChevronDown,
  ChevronUp,
  Camera,
  X,
  Check,
} from "lucide-react";

interface Props {
  onVisitorAdded: () => void; // Callback après ajout réussi
  initialData?: Partial<Visitor>; // Données pré-remplies depuis le scan
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
  });

  // États pour la détection de doublons
  const [existingVisitor, setExistingVisitor] = useState<Visitor | null>(null);
  const [visitHistory, setVisitHistory] = useState<Visit[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ NOUVEAUX ÉTATS pour la caméra
  const [showCamera, setShowCamera] = useState(false);
  const [currentSide, setCurrentSide] = useState<"recto" | "verso" | null>(
    null
  );
  const [photoRecto, setPhotoRecto] = useState<string | null>(null);
  const [photoVerso, setPhotoVerso] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [visitSaved, setVisitSaved] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Met à jour le formulaire quand des données sont scannées
   */
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));

      // Vérifie si le visiteur existe déjà
      if (initialData.numeroCNI) {
        checkForDuplicate(initialData.numeroCNI);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [showCamera, stream]);

  /**
   * Vérifie si un visiteur avec ce numéro CNI existe déjà
   * Si oui, charge son historique de visites
   */
  const checkForDuplicate = async (numeroCNI: string) => {
    if (!numeroCNI || numeroCNI.length < 8) return;

    try {
      console.log("[v0] Vérification doublon pour CNI:", numeroCNI);

      // Recherche dans la base de données
      const existing = await checkExistingVisitor(numeroCNI);

      if (existing) {
        console.log("[v0] Visiteur existant trouvé:", existing);
        setExistingVisitor(existing);

        // Charge l'historique des visites
        const history = await getVisitsByNumeroCNI(numeroCNI);
        console.log("[v0] Historique chargé:", history.length, "visites");
        setVisitHistory(history);
        setShowHistory(true);
      } else {
        console.log("[v0] Nouveau visiteur");
        setExistingVisitor(null);
        setVisitHistory([]);
        setShowHistory(false);
      }
    } catch (error) {
      console.error("[v0] Erreur vérification doublon:", error);
    }
  };

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Vérifie les doublons quand le numéro CNI change
    if (name === "numeroCNI" && value.length >= 8) {
      checkForDuplicate(value);
    }
  };

  // ✅ NOUVELLES FONCTIONS pour la caméra

  /**
   * Démarre la caméra pour capturer une photo
   */
  const startCamera = async (side: "recto" | "verso") => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });

      setStream(mediaStream);
      setCurrentSide(side);
      setShowCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Erreur accès caméra:", error);
      alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  /**
   * Arrête la caméra
   */
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCurrentSide(null);
  };

  /**
   * Capture la photo depuis la vidéo
   */
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const photoData = canvas.toDataURL("image/jpeg", 0.8);

    if (currentSide === "recto") {
      setPhotoRecto(photoData);
    } else if (currentSide === "verso") {
      setPhotoVerso(photoData);
    }

    stopCamera();
  };

  /**
   * Termine le processus après capture des photos
   */
  const finishProcess = () => {
    console.log("[v0] Photos CNI sauvegardées:", { photoRecto, photoVerso });

    // TODO: Ici tu peux sauvegarder les photos dans ta base de données
    // Exemple: await savePhotoCNI(visitorId, photoRecto, photoVerso)

    // Réinitialise tout
    setFormData({
      nom: "",
      prenoms: "",
      dateNaissance: "",
      lieuNaissance: "",
      numeroCNI: "",
      profession: "",
    });
    setPhotoRecto(null);
    setPhotoVerso(null);
    setVisitSaved(false);
    setExistingVisitor(null);
    setVisitHistory([]);
    setShowHistory(false);

    onVisitorAdded();
    alert("✅ Enregistrement terminé avec succès!");
  };

  /**
   * Soumet le formulaire et enregistre la visite
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const now = new Date();
      let visitorId: number;

      // Si le visiteur existe déjà, on utilise son ID
      if (existingVisitor) {
        console.log(
          "[v0] Enregistrement nouvelle visite pour visiteur existant"
        );
        visitorId = existingVisitor.id!;
      } else {
        // Sinon, on crée un nouveau visiteur
        console.log("[v0] Création nouveau visiteur");
        visitorId = await addVisitor(formData);
      }

      // Enregistre la nouvelle visite
      const visit: Visit = {
        visitorId,
        numeroCNI: formData.numeroCNI,
        dateVisite: now.toISOString().split("T")[0],
        heureEntree: now.toLocaleTimeString("fr-FR"),
        motif: "",
        notes: "",
      };

      await addVisit(visit);
      console.log("[v0] Visite enregistrée avec succès");
      // === SAUVEGARDE LES PHOTOS ===
      // SAUVEGARDE LES PHOTOS
      if (photoRecto || photoVerso) {
        await updateVisitorPhotos(visitorId, photoRecto, photoVerso);
        console.log("Photos CNI sauvegardées pour visiteur", visitorId);
      }

      // ✅ Active l'étape de capture photo
      setVisitSaved(true);
      setLoading(false);

      alert(
        "Visite enregistrée! Photographiez maintenant la CNI (recto et verso)."
      );
    } catch (error) {
      console.error("[v0] Erreur enregistrement:", error);
      alert("Erreur lors de l'enregistrement");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      {/* En-tête */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <UserPlus className="w-6 h-6" />
        Enregistrement visiteur
      </h2>

      {/* ========================================== */}
      {/* ÉTAPE 1: FORMULAIRE (avant enregistrement) */}
      {/* ========================================== */}
      {!visitSaved ? (
        <>
          {/* Alerte si données scannées */}
          {initialData && Object.keys(initialData).length > 0 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                Données extraites du scan. Vérifiez et corrigez si nécessaire.
              </p>
            </div>
          )}

          {/* Alerte si visiteur existant détecté */}
          {existingVisitor && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-yellow-800">
                    Visiteur déjà enregistré!
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {existingVisitor.nom} {existingVisitor.prenoms} a déjà{" "}
                    {visitHistory.length} visite(s) enregistrée(s).
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
                {showHistory ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Dropdown de l'historique */}
              {showHistory && visitHistory.length > 0 && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {visitHistory.map((visit, index) => (
                    <div
                      key={visit.id || index}
                      className="p-3 bg-white border border-yellow-200 rounded text-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">
                            Visite #{visitHistory.length - index}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            {visit.dateVisite} à {visit.heureEntree}
                          </p>
                          {visit.heureSortie && (
                            <p className="text-gray-600 text-xs">
                              Sortie: {visit.heureSortie}
                            </p>
                          )}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom(s) *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu de naissance *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro CNI *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession *
                </label>
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
                  {existingVisitor
                    ? "Enregistrer nouvelle visite"
                    : "Enregistrer visiteur"}
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="space-y-4">
          {/* Message de confirmation */}
          <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
            <p className="text-green-700 font-medium flex items-center gap-2">
              <Check className="w-5 h-5" />
              Visiteur enregistré! Photographiez maintenant la CNI (recto et
              verso)
            </p>
          </div>

          {/* Grille pour les 2 photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RECTO */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">📄 CNI Recto</h3>
              {photoRecto ? (
                <div className="relative">
                  <img
                    src={photoRecto}
                    alt="CNI Recto"
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => setPhotoRecto(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startCamera("recto")}
                  className="w-full py-8 border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2"
                >
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-600">Photographier le recto</span>
                </button>
              )}
            </div>

            {/* VERSO */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">📄 CNI Verso</h3>
              {photoVerso ? (
                <div className="relative">
                  <img
                    src={photoVerso}
                    alt="CNI Verso"
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => setPhotoVerso(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startCamera("verso")}
                  className="w-full py-8 border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2"
                >
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-600">Photographier le verso</span>
                </button>
              )}
            </div>
          </div>

          {/* Bouton Terminer */}
          <button
            onClick={finishProcess}
            disabled={!photoRecto || !photoVerso}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {!photoRecto || !photoVerso
              ? "Prenez les 2 photos pour continuer"
              : "Terminer l'enregistrement"}
          </button>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL CAMÉRA */}
      {/* ========================================== */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4">
            {/* En-tête du modal */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                📸 Photographier la CNI -{" "}
                {currentSide === "recto" ? "RECTO" : "VERSO"}
              </h3>
              <button
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Vidéo de la caméra avec cadre de guidage */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full" />
              <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg pointer-events-none m-8" />
              <p className="absolute top-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2 text-sm">
                Placez la CNI dans le cadre jaune
              </p>
            </div>

            {/* Bouton capture */}
            <button
              onClick={capturePhoto}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              📸 Capturer la photo
            </button>
          </div>
        </div>
      )}

      {/* Canvas caché pour la capture d'image */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
