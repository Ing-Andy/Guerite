// ============================================
// GESTION DE LA BASE DE DONNÉES LOCALE (IndexedDB)
// ============================================
// IndexedDB permet de stocker des données localement dans le navigateur
// sans connexion internet. Les données persistent même après fermeture.

import type { Visitor, Visit } from "./types";

const DB_NAME = "GueriteAI"; // Nom de la base de données
const DB_VERSION = 1; // Version (incrémente si structure change)
const VISITORS_STORE = "visitors"; // Table des visiteurs
const VISITS_STORE = "visits"; // Table des visites

/**
 * Ouvre ou crée la base de données IndexedDB
 * Crée les tables (object stores) si elles n'existent pas
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Ouvre la connexion à la base de données
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Gère les erreurs de connexion
    request.onerror = () => reject(request.error);

    // Retourne la base de données une fois ouverte
    request.onsuccess = () => resolve(request.result);

    // Appelé uniquement lors de la première création ou mise à jour de version
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Crée la table "visitors" si elle n'existe pas
      if (!db.objectStoreNames.contains(VISITORS_STORE)) {
        const visitorsStore = db.createObjectStore(VISITORS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        visitorsStore.createIndex("numeroCNI", "numeroCNI", { unique: true });

        // AJOUTE ÇA : Index pour les photos (optionnel, mais utile)
        visitorsStore.createIndex("photo_recto", "photo_recto", {
          unique: false,
        });
        visitorsStore.createIndex("photo_verso", "photo_verso", {
          unique: false,
        });
      }

      // Crée la table "visits" si elle n'existe pas
      if (!db.objectStoreNames.contains(VISITS_STORE)) {
        const visitsStore = db.createObjectStore(VISITS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        // Index sur numeroCNI pour récupérer l'historique rapidement
        visitsStore.createIndex("numeroCNI", "numeroCNI", { unique: false });
        // Index sur visitorId pour liaison avec la table visitors
        visitsStore.createIndex("visitorId", "visitorId", { unique: false });
      }
    };
  });
};

// ============================================
// FONCTIONS POUR LES VISITEURS
// ============================================

/**
 * Vérifie si un visiteur existe déjà (basé sur le numéro CNI)
 * Retourne le visiteur s'il existe, null sinon
 */
export const checkExistingVisitor = async (
  numeroCNI: string
): Promise<Visitor | null> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITORS_STORE], "readonly");
    const store = transaction.objectStore(VISITORS_STORE);
    const index = store.index("numeroCNI");

    // Recherche par numéro CNI
    const request = index.get(numeroCNI);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Ajoute un nouveau visiteur dans la base de données
 * Retourne l'ID du visiteur créé
 */
export const addVisitor = async (
  visitor: Omit<Visitor, "id">
): Promise<number> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITORS_STORE], "readwrite");
    const store = transaction.objectStore(VISITORS_STORE);

    const request = store.add({
      ...visitor,
      photo_recto: visitor.photo_recto || null,
      photo_verso: visitor.photo_verso || null,
    });

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Récupère tous les visiteurs enregistrés
 */
export const getAllVisitors = async (): Promise<Visitor[]> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITORS_STORE], "readonly")
    const store = transaction.objectStore(VISITORS_STORE)

    const request = store.getAll()

    request.onsuccess = () => {
      console.log("Visiteurs chargés :", request.result) // DEBUG
      resolve(request.result)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Supprime un visiteur (et toutes ses visites associées)
 */
export const deleteVisitor = async (id: number): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [VISITORS_STORE, VISITS_STORE],
      "readwrite"
    );

    // Supprime le visiteur
    const visitorsStore = transaction.objectStore(VISITORS_STORE);
    visitorsStore.delete(id);

    // Supprime toutes ses visites
    const visitsStore = transaction.objectStore(VISITS_STORE);
    const index = visitsStore.index("visitorId");
    const request = index.openCursor(IDBKeyRange.only(id));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// ============================================
// FONCTIONS POUR LES VISITES
// ============================================

/**
 * Enregistre une nouvelle visite
 * Retourne l'ID de la visite créée
 */
export const addVisit = async (visit: Visit): Promise<number> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITS_STORE], "readwrite");
    const store = transaction.objectStore(VISITS_STORE);

    const request = store.add(visit);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Récupère l'historique des visites d'un visiteur (par numéro CNI)
 * Trié par date décroissante (plus récent en premier)
 */
export const getVisitsByNumeroCNI = async (
  numeroCNI: string
): Promise<Visit[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITS_STORE], "readonly");
    const store = transaction.objectStore(VISITS_STORE);
    const index = store.index("numeroCNI");

    const request = index.getAll(numeroCNI);

    request.onsuccess = () => {
      // Trie par date décroissante
      const visits = request.result.sort((a, b) => {
        const dateA = new Date(`${a.dateVisite} ${a.heureEntree}`);
        const dateB = new Date(`${b.dateVisite} ${b.heureEntree}`);
        return dateB.getTime() - dateA.getTime();
      });
      resolve(visits);
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Met à jour les photos d'un visiteur existant
 */
export const updateVisitorPhotos = async (
  visitorId: number,
  photoRecto: string | null,
  photoVerso: string | null
): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITORS_STORE], "readwrite");
    const store = transaction.objectStore(VISITORS_STORE);

    const getRequest = store.get(visitorId);

    getRequest.onsuccess = () => {
      const visitor = getRequest.result;
      if (visitor) {
        visitor.photo_recto = photoRecto;
        visitor.photo_verso = photoVerso;
        store.put(visitor);
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

/**
 * Récupère toutes les visites de tous les visiteurs
 */
export const getAllVisits = async (): Promise<Visit[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITS_STORE], "readonly");
    const store = transaction.objectStore(VISITS_STORE);

    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Met à jour l'heure de sortie d'une visite
 */
export const updateVisitExit = async (
  visitId: number,
  heureSortie: string
): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITS_STORE], "readwrite");
    const store = transaction.objectStore(VISITS_STORE);

    // Récupère la visite
    const getRequest = store.get(visitId);

    getRequest.onsuccess = () => {
      const visit = getRequest.result;
      if (visit) {
        // Met à jour l'heure de sortie
        visit.heureSortie = heureSortie;
        store.put(visit);
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};
