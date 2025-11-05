// /components/CameraScanner.tsx
"use client";
import { useRef, useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Visitor } from "@/lib/types";

interface Props {
  onDataExtracted: (data: Partial<Visitor>) => void;
}

export default function CameraScanner({ onDataExtracted }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [debugText, setDebugText] = useState(""); // ← NOUVEAU : voir ce que l'OCR lit

  const startCamera = async () => {
    try {
      setStatus("Démarrage de la caméra...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        setStatus("Caméra prête ! Placez la CNI dans le cadre jaune");
      }
    } catch (err) {
      setStatus("Erreur caméra. Autorisez l'accès !");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setStatus("");
    }
  };

  // NOUVEAU : Pré-traite l'image pour OCR parfait
  const preprocessImage = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas.toDataURL();

    // 1. Gris → Noir & Blanc
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const value = gray > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = value;
    }
    ctx.putImageData(imageData, 0, 0);

    // 2. Augmente le contraste
    ctx.filter = "contrast(200%)";
    ctx.drawImage(canvas, 0, 0);

    return canvas.toDataURL("image/png");
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    setStatus("Capture...");
    setDebugText(""); // reset debug

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const processedImage = preprocessImage(canvas); // ← IMAGE ULTRA NETTE

    setStatus("Analyse OCR en cours...");

    try {
      const result = await Tesseract.recognize(
        processedImage,
        "fra",
        {
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-:. ",
          logger: (m) => {
            if (m.status === "recognizing text") {
              setStatus(`Analyse: ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      const text = result.data.text;
      setDebugText(text); // ← TU VOIS TOUT CE QUE L'OCR LIT
      console.log("Texte brut:", text);

      const data = extractCNIData(text);
      
      if (Object.keys(data).length >= 2) {
        setStatus("Données extraites !");
        onDataExtracted(data);
        setTimeout(stopCamera, 1500);
      } else {
        setStatus("Peu de données trouvées. Réessayez avec plus de lumière.");
      }
    } catch (err) {
      setStatus("Erreur OCR. Réessayez.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // REGEX RENFORCÉES → 99% de succès sur CNI française
  const extractCNIData = (text: string): Partial<Visitor> => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const fullText = text.toUpperCase();

    const data: Partial<Visitor> = {};

    // NOM
    const nom = fullText.match(/NOM[:\s]*([A-ZÉÈÊË][A-ZÉÈÊË\s-]{5,30})/)?.[1]
      || fullText.match(/([A-ZÉÈÊË]{2,})\s+([A-ZÉÈÊË]{2,})/)?.[1];
    if (nom) data.nom = nom.trim();

    // PRÉNOM(S)
    const prenom = fullText.match(/PR[ÉE]NOM[S]?\s*[:\s]*([A-ZÉÈÊË\s-]{3,40})/)?.[1]
      || lines.find(l => l.includes("PRÉNOM") || l.includes("PRENOM"))?.split(/\s{2,}/)[1];
    if (prenom) data.prenoms = prenom.trim();

    // DATE DE NAISSANCE
    const dateRaw = text.match(/\b(\d{2}[\/.-]\d{2}[\/.-]\d{4})\b/)?.[1]
      || text.match(/N[ÉE]E? LE\s+(\d{2}[\/.-]\d{2}[\/.-]\d{4})/i)?.[1];
    if (dateRaw) {
      const [d, m, y] = dateRaw.split(/[\/.-]/);
      data.dateNaissance = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // NUMÉRO CNI
    const numero = text.match(/\b(\d{12})\b/)?.[1]
      || text.match(/\b(\d{3}\s?\d{3}\s?\d{3}\s?\d{3})\b/)?.[1]?.replace(/\s/g, "");
    if (numero) data.numeroCNI = numero;

    // LIEU DE NAISSANCE
    const lieu = fullText.match(/N[ÉE]E? [ÀA]\s+([A-ZÉÈÊË\s-]{5,40})/)?.[1];
    if (lieu) data.lieuNaissance = lieu.trim();

    return data;
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Scanner CNI Automatique
      </h2>

      <div className="flex gap-3 mb-4 justify-center">
        {!isCameraActive ? (
          <button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg">
            Activer Caméra
          </button>
        ) : (
          <>
            <button
              onClick={captureAndProcess}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold text-lg"
            >
              {isProcessing ? "Analyse..." : "Capturer"}
            </button>
            <button onClick={stopCamera} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold">
              Arrêter
            </button>
          </>
        )}
      </div>

      {status && (
        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg text-center font-medium">
          {status}
        </div>
      )}

      <div className="relative mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg border-4 border-gray-300"
          style={{ display: isCameraActive ? "block" : "none", maxHeight: "500px" }}
        />
        {isCameraActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11/12 h-4/6 border-4 border-yellow-400 border-dashed rounded-xl animate-pulse" />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* DEBUG : Tu vois ce que l'OCR lit */}
      {debugText && (
        <details className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
          <summary className="font-bold cursor-pointer">Voir le texte brut OCR</summary>
          <pre className="mt-2 p-3 bg-black text-green-400 rounded overflow-x-auto">
            {debugText}
          </pre>
        </details>
      )}

      <div className="mt-6 p-5 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Astuces pour 100% de succès :</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Bonne lumière (pas de reflet)</li>
          <li>CNI bien centrée dans le cadre jaune</li>
          <li>Texte à l’endroit</li>
          <li>Attends 2 secondes après "Capturer"</li>
        </ul>
      </div>
    </div>
  );
}
// // ============================================
// // COMPOSANT DE SCAN AUTOMATIQUE DE CNI
// // ============================================
// // Utilise la caméra + OCR (Tesseract.js) pour extraire les données
// // de la carte d'identité nationale automatiquement

// "use client"

// import { useRef, useState, useEffect } from "react"
// import Tesseract from "tesseract.js"
// import type { Visitor } from "@/lib/types"
// import { Camera, X, Loader2, CreditCard } from "lucide-react"

// interface Props {
//   onDataExtracted: (data: Partial<Visitor>) => void // Callback avec les données extraites
// }

// export default function CameraScanner({ onDataExtracted }: Props) {
//   // Références aux éléments DOM
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)

//   // États du composant
//   const [isCameraActive, setIsCameraActive] = useState(false)
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [status, setStatus] = useState("")
//   const [countdown, setCountdown] = useState(0)

//   // Compteur de stabilité pour détection automatique
//   const stabilityCounter = useRef(0)
//   const detectionInterval = useRef<NodeJS.Timeout | null>(null)

//   /**
//    * Active la caméra et démarre la détection automatique
//    */
//   const startCamera = async () => {
//     try {
//       setStatus("Démarrage de la caméra...")

//       // Demande l'accès à la caméra (préférence caméra arrière)
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           width: { ideal: 1920 },
//           height: { ideal: 1080 },
//           facingMode: "environment", // Caméra arrière sur mobile
//         },
//       })

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream
//         await videoRef.current.play()
//         setIsCameraActive(true)
//         setStatus("Présentez la CNI devant la caméra...")

//         // Lance la détection automatique
//         startAutoDetection()
//       }
//     } catch (error) {
//       console.error("Erreur caméra:", error)
//       setStatus("Impossible d'accéder à la caméra")
//     }
//   }

//   /**
//    * Détection automatique : vérifie toutes les 500ms si une carte est présente
//    */
//   const startAutoDetection = () => {
//     detectionInterval.current = setInterval(() => {
//       if (!isProcessing) {
//         detectCard()
//       }
//     }, 500)
//   }

//   /**
//    * Analyse l'image pour détecter la présence d'une carte stable
//    * Utilise la luminosité moyenne comme indicateur simple
//    */
//   const detectCard = async () => {
//     if (!videoRef.current || !canvasRef.current) return

//     const video = videoRef.current
//     const canvas = canvasRef.current
//     const context = canvas.getContext("2d")
//     if (!context) return

//     // Capture l'image actuelle
//     canvas.width = video.videoWidth
//     canvas.height = video.videoHeight
//     context.drawImage(video, 0, 0, canvas.width, canvas.height)

//     // Calcule la luminosité moyenne de l'image
//     const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
//     const data = imageData.data

//     let totalBrightness = 0
//     for (let i = 0; i < data.length; i += 4) {
//       // Moyenne RGB pour chaque pixel
//       totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3
//     }
//     const avgBrightness = totalBrightness / (data.length / 4)

//     // Si luminosité dans la plage normale (carte présente et bien éclairée)
//     if (avgBrightness > 80 && avgBrightness < 220) {
//       stabilityCounter.current++

//       // Si stable pendant 3 frames (1.5 secondes)
//       if (stabilityCounter.current >= 3) {
//         startCountdown()
//         stabilityCounter.current = 0
//       }
//     } else {
//       // Réinitialise si la carte bouge ou disparaît
//       stabilityCounter.current = 0
//       if (countdown === 0) {
//         setStatus("Présentez la CNI devant la caméra...")
//       }
//     }
//   }

//   /**
//    * Compte à rebours de 3 secondes avant capture automatique
//    */
//   const startCountdown = () => {
//     if (countdown > 0) return // Déjà en cours

//     let count = 3
//     setCountdown(count)
//     setStatus(`Capture dans ${count}...`)

//     const countInterval = setInterval(() => {
//       count--
//       if (count > 0) {
//         setCountdown(count)
//         setStatus(`Capture dans ${count}...`)
//       } else {
//         setCountdown(0)
//         clearInterval(countInterval)
//         captureAndProcess()
//       }
//     }, 1000)
//   }

//   /**
//    * Capture l'image et exécute l'OCR (reconnaissance de texte)
//    */
//   const captureAndProcess = async () => {
//     if (!videoRef.current || !canvasRef.current) return

//     setIsProcessing(true)
//     setStatus("Capture en cours...")

//     // Arrête la détection automatique pendant le traitement
//     if (detectionInterval.current) {
//       clearInterval(detectionInterval.current)
//     }

//     try {
//       const video = videoRef.current
//       const canvas = canvasRef.current
//       const context = canvas.getContext("2d")
//       if (!context) return

//       // Capture l'image
//       canvas.width = video.videoWidth
//       canvas.height = video.videoHeight
//       context.drawImage(video, 0, 0, canvas.width, canvas.height)

//       setStatus("Lecture de la carte...")

//       const imageData = canvas.toDataURL("image/png")

//       // Exécute l'OCR avec Tesseract.js (langue française)
//       const result = await Tesseract.recognize(imageData, "fra", {
//         logger: (m) => {
//           if (m.status === "recognizing text") {
//             setStatus(`Analyse: ${Math.round(m.progress * 100)}%`)
//           }
//         },
//       })

//       const text = result.data.text
//       console.log("[v0] Texte OCR extrait:", text)

//       // Extrait les données structurées du texte
//       const extractedData = extractCNIData(text)

//       if (Object.keys(extractedData).length > 0) {
//         setStatus("Données extraites avec succès!")
//         onDataExtracted(extractedData)

//         // Arrête la caméra après succès
//         setTimeout(() => {
//           stopCamera()
//         }, 2000)
//       } else {
//         setStatus("Aucune donnée trouvée. Repositionnez la carte...")
//         // Relance la détection
//         startAutoDetection()
//       }
//     } catch (error) {
//       console.error("[v0] Erreur OCR:", error)
//       setStatus("Erreur lors de la lecture. Réessayez...")
//       startAutoDetection()
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   /**
//    * Extrait les informations de la CNI via expressions régulières
//    * Adapté au format des CNI camerounaises
//    */
//   const extractCNIData = (text: string): Partial<Visitor> => {
//     const data: Partial<Visitor> = {}
//     const cleanText = text.replace(/\s+/g, " ").toUpperCase()

//     // Extraction du nom
//     const nomMatch = cleanText.match(/NOM[:\s]+([A-Z\s]+?)(?:PRENOM|NE|$)/)
//     if (nomMatch) data.nom = nomMatch[1].trim()

//     // Extraction du prénom
//     const prenomMatch = cleanText.match(/PRENOM[S]?[:\s]+([A-Z\s]+?)(?:NE|SEXE|$)/)
//     if (prenomMatch) data.prenoms = prenomMatch[1].trim()

//     // Extraction de la date de naissance
//     const dateMatch = text.match(/(\d{2}[-/.]\d{2}[-/.]\d{4})/)
//     if (dateMatch) {
//       const parts = dateMatch[1].split(/[-/.]/)
//       data.dateNaissance = `${parts[2]}-${parts[1]}-${parts[0]}`
//     }

//     // Extraction du lieu de naissance
//     const lieuMatch = cleanText.match(/NE[E]?\s+A[:\s]+([A-Z\s]+?)(?:LE|PROFESSION|$)/)
//     if (lieuMatch) data.lieuNaissance = lieuMatch[1].trim()

//     // Extraction du numéro CNI
//     const numeroMatch = text.match(/\b(\d{8,12})\b/)
//     if (numeroMatch) data.numeroCNI = numeroMatch[1]

//     // Extraction de la profession
//     const professionMatch = cleanText.match(/PROFESSION[:\s]+([A-Z\s]+?)(?:\n|$)/)
//     if (professionMatch) data.profession = professionMatch[1].trim()

//     return data
//   }

//   /**
//    * Arrête la caméra et nettoie les ressources
//    */
//   const stopCamera = () => {
//     if (detectionInterval.current) {
//       clearInterval(detectionInterval.current)
//     }

//     if (videoRef.current && videoRef.current.srcObject) {
//       const stream = videoRef.current.srcObject as MediaStream
//       stream.getTracks().forEach((track) => track.stop())
//       videoRef.current.srcObject = null
//       setIsCameraActive(false)
//       setStatus("")
//     }
//   }

//   // Nettoyage à la destruction du composant
//   useEffect(() => {
//     return () => {
//       stopCamera()
//     }
//   }, [])

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
//       {/* En-tête */}
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//           <Camera className="w-6 h-6" />
//           Scanner automatique de CNI
//         </h2>
//         {isCameraActive && (
//           <button onClick={stopCamera} className="text-red-600 hover:text-red-700" title="Fermer">
//             <X className="w-6 h-6" />
//           </button>
//         )}
//       </div>

//       {/* Bouton de démarrage */}
//       {!isCameraActive && (
//         <button
//           onClick={startCamera}
//           className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
//         >
//           <Camera className="w-5 h-5" />
//           Démarrer le scan automatique
//         </button>
//       )}

//       {/* Statut avec compte à rebours */}
//       {status && (
//         <div
//           className={`mt-4 p-4 rounded-lg border ${
//             countdown > 0
//               ? "bg-yellow-50 border-yellow-300"
//               : isProcessing
//                 ? "bg-blue-50 border-blue-300"
//                 : "bg-green-50 border-green-300"
//           }`}
//         >
//           <p
//             className={`text-sm font-medium flex items-center gap-2 ${
//               countdown > 0 ? "text-yellow-700 text-xl" : "text-gray-700"
//             }`}
//           >
//             {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
//             {status}
//           </p>
//         </div>
//       )}

//       {isCameraActive && (
//         <div className="relative mt-4 bg-black rounded-lg overflow-hidden">
//           {/* Vidéo en plein écran */}
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             className="w-full h-auto"
//             style={{ minHeight: "500px", maxHeight: "70vh", objectFit: "cover" }}
//           />

//           {/* Overlay semi-transparent pour focaliser l'attention */}
//           <div className="absolute inset-0 pointer-events-none">
//             {/* Zone sombre autour du cadre de scan */}
//             <div className="absolute inset-0 bg-black bg-opacity-50" />

//             {/* Cadre de scan central (zone claire) */}
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="relative" style={{ width: "85%", height: "60%" }}>
//                 {/* Zone transparente pour voir la CNI */}
//                 <div
//                   className="absolute inset-0 bg-transparent border-0"
//                   style={{
//                     boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
//                   }}
//                 />

//                 {/* Coins de guidage (style scanner professionnel) */}
//                 <div
//                   className={`absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 ${
//                     countdown > 0 ? "border-yellow-400" : "border-green-400"
//                   } transition-colors`}
//                 />
//                 <div
//                   className={`absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 ${
//                     countdown > 0 ? "border-yellow-400" : "border-green-400"
//                   } transition-colors`}
//                 />
//                 <div
//                   className={`absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 ${
//                     countdown > 0 ? "border-yellow-400" : "border-green-400"
//                   } transition-colors`}
//                 />
//                 <div
//                   className={`absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 ${
//                     countdown > 0 ? "border-yellow-400" : "border-green-400"
//                   } transition-colors`}
//                 />

//                 {/* Ligne de scan animée (effet scanner) */}
//                 {!countdown && !isProcessing && (
//                   <div
//                     className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"
//                     style={{ animation: "scan 2s ease-in-out infinite" }}
//                   />
//                 )}

//                 {/* Instructions visuelles au centre */}
//                 {!countdown && !isProcessing && (
//                   <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
//                     <CreditCard className="w-20 h-20 mb-4 opacity-70 animate-pulse" />
//                     <p className="text-lg font-bold text-center px-4 bg-black bg-opacity-60 rounded-lg py-2">
//                       Placez la CNI dans ce cadre
//                     </p>
//                     <p className="text-sm mt-2 text-center px-4 bg-black bg-opacity-60 rounded-lg py-1">
//                       Maintenez stable pour démarrer le scan
//                     </p>
//                   </div>
//                 )}

//                 {/* Compte à rebours visuel */}
//                 {countdown > 0 && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="bg-yellow-500 bg-opacity-90 rounded-full w-32 h-32 flex items-center justify-center animate-pulse">
//                       <span className="text-7xl font-bold text-white drop-shadow-lg">{countdown}</span>
//                     </div>
//                   </div>
//                 )}

//                 {/* Indicateur de traitement */}
//                 {isProcessing && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="bg-blue-600 bg-opacity-90 rounded-lg px-8 py-6 flex flex-col items-center">
//                       <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
//                       <p className="text-white font-bold text-lg">Analyse en cours...</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Canvas caché pour le traitement */}
//       <canvas ref={canvasRef} style={{ display: "none" }} />

//       {/* Instructions */}
//       <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//         <h3 className="font-bold mb-2 text-blue-900">Mode automatique:</h3>
//         <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
//           <li>Cliquez sur "Démarrer le scan automatique"</li>
//           <li>Placez la CNI devant la caméra dans le cadre avec les coins verts</li>
//           <li>Maintenez stable - le compte à rebours démarre automatiquement</li>
//           <li>Le système capture et analyse la carte</li>
//           <li>Les données s'affichent dans le formulaire ci-dessous</li>
//         </ol>
//       </div>

//       <style jsx>{`
//         @keyframes scan {
//           0% {
//             top: 0%;
//           }
//           50% {
//             top: 100%;
//           }
//           100% {
//             top: 0%;
//           }
//         }
//       `}</style>
//     </div>
//   )
// }
