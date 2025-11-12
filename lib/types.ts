// ============================================
// TYPES ET INTERFACES DU SYSTÈME GUERITE AI
// ============================================

/**
 * Interface représentant un visiteur dans le système
 * Chaque visiteur a un ID unique et un historique de visites
 */
// Dans lib/types.ts
export interface Visitor {
  id?: number
  nom: string
  prenoms: string
  dateNaissance: string
  lieuNaissance: string
  phone: string
  numeroCNI: string
  profession: string
  photo_recto?: string | null
  photo_verso?: string | null
}

/**
 * Interface représentant une visite individuelle
 * Permet de tracker l'historique des passages
 */
export interface Visit {
  id?: number // ID auto-généré
  visitorId: number // Référence au visiteur (clé étrangère)
  numeroCNI: string // Numéro CNI pour liaison rapide
  dateVisite: string // Date de la visite (YYYY-MM-DD)
  heureEntree: string // Heure d'entrée (HH:MM:SS)
  heureSortie?: string // Heure de sortie (optionnel)
  motif?: string // Raison de la visite (optionnel)
  notes?: string // Notes additionnelles (optionnel)
}

/**
 * Interface pour les données combinées (visiteur + historique)
 * Utilisée pour l'affichage dans le tableau
 */
export interface VisitorWithHistory {
  visitor: Visitor // Informations du visiteur
  visits: Visit[] // Liste de toutes ses visites
  totalVisits: number // Nombre total de visites
  lastVisit?: Visit // Dernière visite enregistrée
}
