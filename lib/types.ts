// ============================================
// TYPES ET INTERFACES DU SYSTÈME GUERITE AI
// ============================================

/**
 * Interface représentant un visiteur dans le système
 * Chaque visiteur a un ID unique et un historique de visites
 */
export interface Visitor {
  id?: number // ID auto-généré par IndexedDB
  nom: string // Nom de famille
  prenoms: string // Prénom(s)
  dateNaissance: string // Format: YYYY-MM-DD
  lieuNaissance: string // Ville/Pays de naissance
  numeroCNI: string // Numéro unique de la CNI (clé de détection des doublons)
  profession: string // Métier du visiteur
  photoUrl?: string // Photo capturée (optionnel)
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
