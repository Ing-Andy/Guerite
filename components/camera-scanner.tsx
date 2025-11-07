"use client"
import { useRef, useState, useEffect } from "react"
import Tesseract from "tesseract.js"
import type { Visitor } from "@/lib/types"

interface Props {
  onDataExtracted: (data: Partial<Visitor>) => void
}

export default function CameraScanner({ onDataExtracted }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState("")
  const [debugText, setDebugText] = useState("")

  const startCamera = async () => {
    try {
      setStatus("Démarrage de la caméra...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsCameraActive(true)
        setStatus("Caméra prête ! Placez la CNI dans le cadre jaune")
      }
    } catch (err) {
      setStatus("Erreur caméra. Autorisez l'accès !")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      ;(videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
      setStatus("")
    }
  }

  const preprocessImage = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return canvas.toDataURL()

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      const value = gray > 128 ? 255 : 0
      data[i] = data[i + 1] = data[i + 2] = value
    }
    ctx.putImageData(imageData, 0, 0)

    return canvas.toDataURL("image/png")
  }

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) return
    setIsProcessing(true)
    setStatus("Capture...")
    setDebugText("")

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const processedImage = preprocessImage(canvas)

    setStatus("Analyse OCR en cours...")

    try {
      const result = await Tesseract.recognize(processedImage, "fra", {
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-:. ",
        logger: (m) => {
          if (m.status === "recognizing text") {
            setStatus(`Analyse: ${Math.round(m.progress * 100)}%`)
          }
        },
      })

      const text = result.data.text
      setDebugText(text)
      console.log("Texte brut:", text)

      const data = extractCNIData(text)

      if (Object.keys(data).length >= 2) {
        setStatus("Données extraites !")
        onDataExtracted(data)
        setTimeout(stopCamera, 1500)
      } else {
        setStatus("Peu de données trouvées. Réessayez avec plus de lumière.")
      }
    } catch (err) {
      setStatus("Erreur OCR. Réessayez.")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const extractCNIData = (text: string): Partial<Visitor> => {
    const fullText = text.toUpperCase()
    const data: Partial<Visitor> = {}

    const nom =
      fullText.match(/NOM[:\s]*([A-ZÉÈÊË][A-ZÉÈÊË\s-]{5,30})/)?.[1] ||
      fullText.match(/([A-ZÉÈÊË]{2,})\s+([A-ZÉÈÊË]{2,})/)?.[1]
    if (nom) data.nom = nom.trim()

    const prenom = fullText.match(/PR[ÉE]NOM[S]?\s*[:\s]*([A-ZÉÈÊË\s-]{3,40})/)?.[1]
    if (prenom) data.prenoms = prenom.trim()

    const dateRaw =
      text.match(/\b(\d{2}[/.-]\d{2}[/.-]\d{4})\b/)?.[1] || text.match(/N[ÉE]E? LE\s+(\d{2}[/.-]\d{2}[/.-]\d{4})/i)?.[1]
    if (dateRaw) {
      const [d, m, y] = dateRaw.split(/[/.-]/)
      data.dateNaissance = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
    }

    const numero =
      text.match(/\b(\d{12})\b/)?.[1] || text.match(/\b(\d{3}\s?\d{3}\s?\d{3}\s?\d{3})\b/)?.[1]?.replace(/\s/g, "")
    if (numero) data.numeroCNI = numero

    const lieu = fullText.match(/N[ÉE]E? [ÀA]\s+([A-ZÉÈÊË\s-]{5,40})/)?.[1]
    if (lieu) data.lieuNaissance = lieu.trim()

    return data
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Scanner CNI Automatique</h2>

      <div className="flex gap-3 mb-4 justify-center">
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg"
          >
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
            <button
              onClick={stopCamera}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              Arrêter
            </button>
          </>
        )}
      </div>

      {status && (
        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg text-center font-medium">{status}</div>
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

      {debugText && (
        <details className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
          <summary className="font-bold cursor-pointer">Voir le texte brut OCR</summary>
          <pre className="mt-2 p-3 bg-black text-green-400 rounded overflow-x-auto">{debugText}</pre>
        </details>
      )}

      <div className="mt-6 p-5 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Astuces pour 100% de succès :</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Bonne lumière (pas de reflet)</li>
          <li>CNI bien centrée dans le cadre jaune</li>
          <li>Texte à l'endroit</li>
          <li>Attends 2 secondes après "Capturer"</li>
        </ul>
      </div>
    </div>
  )
}
