// ============================================
// GESTION DE LA BASE DE DONNÉES LOCALE (IndexedDB)
// ============================================

import type { Visitor, Visit } from "./types"

const DB_NAME = "GueriteAI"
const DB_VERSION = 1
const VISITORS_STORE = "visitors"
const VISITS_STORE = "visits"

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(VISITORS_STORE)) {
        const visitorsStore = db.createObjectStore(VISITORS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        })
        visitorsStore.createIndex("numeroCNI", "numeroCNI", { unique: true })
      }

      if (!db.objectStoreNames.contains(VISITS_STORE)) {
        const visitsStore = db.createObjectStore(VISITS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        })
        visitsStore.createIndex("numeroCNI", "numeroCNI", { unique: false })
        visitsStore.createIndex("visitorId", "visitorId", { unique: false })
      }
    }
  })
}

export const checkExistingVisitor = async (numeroCNI: string): Promise<Visitor | null> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITORS_STORE], "readonly")
    const store = transaction.objectStore(VISITORS_STORE)
    const index = store.index("numeroCNI")

    const request = index.get(numeroCNI)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export const addVisitor = async (visitor: Omit<Visitor, "id">): Promise<number> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITORS_STORE], "readwrite")
    const store = transaction.objectStore(VISITORS_STORE)

    const request = store.add({
      ...visitor,
      photo_recto: visitor.photo_recto || null,
      photo_verso: visitor.photo_verso || null,
    })

    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

export const getAllVisitors = async (): Promise<Visitor[]> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITORS_STORE], "readonly")
    const store = transaction.objectStore(VISITORS_STORE)

    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const deleteVisitor = async (id: number): Promise<void> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITORS_STORE, VISITS_STORE], "readwrite")

    const visitorsStore = transaction.objectStore(VISITORS_STORE)
    visitorsStore.delete(id)

    const visitsStore = transaction.objectStore(VISITS_STORE)
    const index = visitsStore.index("visitorId")
    const request = index.openCursor(IDBKeyRange.only(id))

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export const addVisit = async (visit: Omit<Visit, "id">): Promise<number> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITS_STORE], "readwrite")
    const store = transaction.objectStore(VISITS_STORE)

    const request = store.add(visit)

    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

export const getVisitsByNumeroCNI = async (numeroCNI: string): Promise<Visit[]> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITS_STORE], "readonly")
    const store = transaction.objectStore(VISITS_STORE)
    const index = store.index("numeroCNI")

    const request = index.getAll(numeroCNI)

    request.onsuccess = () => {
      const visits = request.result.sort((a, b) => {
        const dateA = new Date(`${a.dateVisite} ${a.heureEntree}`)
        const dateB = new Date(`${b.dateVisite} ${b.heureEntree}`)
        return dateB.getTime() - dateA.getTime()
      })
      resolve(visits)
    }
    request.onerror = () => reject(request.error)
  })
}

export const getAllVisits = async (): Promise<Visit[]> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITS_STORE], "readonly")
    const store = transaction.objectStore(VISITS_STORE)

    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const updateVisitorPhotos = async (
  visitorId: number,
  photoRecto: string | null,
  photoVerso: string | null,
): Promise<void> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITORS_STORE], "readwrite")
    const store = transaction.objectStore(VISITORS_STORE)

    const getRequest = store.get(visitorId)

    getRequest.onsuccess = () => {
      const visitor = getRequest.result
      if (visitor) {
        visitor.photo_recto = photoRecto
        visitor.photo_verso = photoVerso
        store.put(visitor)
      }
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export const updateVisitExit = async (visitId: number, heureSortie: string): Promise<void> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VISITS_STORE], "readwrite")
    const store = transaction.objectStore(VISITS_STORE)

    const getRequest = store.get(visitId)

    getRequest.onsuccess = () => {
      const visit = getRequest.result
      if (visit) {
        visit.heureSortie = heureSortie
        store.put(visit)
      }
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}
