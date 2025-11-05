# Guerite AI - Système de Gestion Autonome des Visiteurs

## Description

Guerite AI est une application web autonome de gestion de guérite intelligente. Elle permet l'enregistrement des visiteurs via scan automatique de CNI ou saisie manuelle, avec détection automatique des doublons et historique complet des visites.

## Fonctionnalités principales

### 1. Scan automatique de CNI (Option 1)
- Activation de la caméra du dispositif
- Détection automatique de la présence d'une carte d'identité
- Compte à rebours de 3 secondes avant capture
- Extraction automatique des données via OCR (Tesseract.js)
- Pré-remplissage automatique du formulaire

### 2. Saisie manuelle (Option 2)
- Formulaire complet pour entrée manuelle
- Validation des champs obligatoires
- Correction possible des données scannées

### 3. Détection intelligente des doublons
- Vérification automatique basée sur le numéro CNI
- Alerte visuelle si le visiteur est déjà enregistré
- Affichage du nombre total de visites

### 4. Historique des visites
- Dropdown affichant toutes les visites précédentes
- Informations détaillées: date, heure d'entrée, heure de sortie
- Tri chronologique (plus récent en premier)

### 5. Export PDF
- Génération d'un PDF complet du registre
- Inclut tous les visiteurs et leur historique
- Format professionnel avec en-têtes et statistiques

### 6. Fonctionnement autonome
- 100% hors ligne, aucune connexion internet requise
- Base de données locale (IndexedDB)
- Données persistantes même après fermeture du navigateur

## Architecture technique

### Structure des fichiers

\`\`\`
guerite-ai/
├── app/
│   ├── page.tsx              # Page principale
│   ├── layout.tsx            # Layout de l'application
│   └── globals.css           # Styles globaux
├── components/
│   ├── camera-scanner.tsx    # Composant de scan automatique
│   ├── visitor-form.tsx      # Formulaire d'enregistrement
│   └── visitor-list.tsx      # Liste avec historique
├── lib/
│   ├── types.ts              # Types TypeScript
│   └── db.ts                 # Gestion IndexedDB
└── README.md                 # Documentation
\`\`\`

### Technologies utilisées

- **Next.js 16** : Framework React avec App Router
- **TypeScript** : Typage statique pour la robustesse
- **IndexedDB** : Base de données locale du navigateur
- **Tesseract.js** : OCR pour extraction de texte depuis images
- **jsPDF + autoTable** : Génération de PDF
- **Tailwind CSS** : Styles utilitaires
- **Lucide React** : Icônes modernes

## Base de données locale

### Table `visitors`
Stocke les informations des visiteurs uniques.

| Champ          | Type   | Description                    |
|----------------|--------|--------------------------------|
| id             | number | Clé primaire auto-incrémentée  |
| nom            | string | Nom de famille                 |
| prenoms        | string | Prénom(s)                      |
| dateNaissance  | string | Date de naissance (YYYY-MM-DD) |
| lieuNaissance  | string | Lieu de naissance              |
| numeroCNI      | string | Numéro CNI (unique)            |
| profession     | string | Métier                         |

### Table `visits`
Stocke l'historique de toutes les visites.

| Champ        | Type   | Description                    |
|--------------|--------|--------------------------------|
| id           | number | Clé primaire auto-incrémentée  |
| visitorId    | number | Référence au visiteur          |
| numeroCNI    | string | Numéro CNI (pour liaison)      |
| dateVisite   | string | Date de la visite              |
| heureEntree  | string | Heure d'entrée                 |
| heureSortie  | string | Heure de sortie (optionnel)    |
| motif        | string | Raison de la visite (optionnel)|
| notes        | string | Notes (optionnel)              |

## Flux d'utilisation

### Scénario 1: Nouveau visiteur avec scan
1. Cliquer sur "Option 1: Scan automatique CNI"
2. Cliquer sur "Démarrer le scan automatique"
3. Présenter la CNI devant la caméra
4. Maintenir stable pendant 3 secondes
5. Le système capture et analyse automatiquement
6. Basculement automatique vers le formulaire pré-rempli
7. Vérifier/corriger les données si nécessaire
8. Cliquer sur "Enregistrer visiteur"
9. Le visiteur apparaît dans le tableau

### Scénario 2: Visiteur existant (doublon détecté)
1. Scanner ou saisir le numéro CNI
2. Alerte jaune: "Visiteur déjà enregistré!"
3. Affichage du nombre de visites précédentes
4. Cliquer sur "Afficher l'historique"
5. Dropdown avec toutes les visites passées
6. Cliquer sur "Enregistrer nouvelle visite"
7. Une nouvelle ligne de visite est ajoutée

### Scénario 3: Saisie manuelle
1. Cliquer sur "Option 2: Saisie manuelle"
2. Remplir tous les champs obligatoires
3. Le système vérifie automatiquement les doublons
4. Cliquer sur "Enregistrer visiteur"

### Scénario 4: Export PDF
1. Aller dans la section "Registre des visiteurs"
2. Cliquer sur "Télécharger PDF"
3. Le PDF se génère avec tous les visiteurs et leur historique
4. Fichier téléchargé: `guerite_ai_YYYY-MM-DD.pdf`

## Maintenance et personnalisation

### Modifier les champs du formulaire
Éditer `lib/types.ts` pour ajouter/supprimer des champs, puis mettre à jour:
- `components/visitor-form.tsx` (formulaire)
- `components/camera-scanner.tsx` (extraction OCR)
- `lib/db.ts` (structure de la base de données)

### Améliorer l'OCR
Dans `components/camera-scanner.tsx`, fonction `extractCNIData()`:
- Ajuster les expressions régulières selon le format de vos CNI
- Tester avec différentes cartes pour optimiser la détection

### Personnaliser le PDF
Dans `components/visitor-list.tsx`, fonction `exportToPDF()`:
- Modifier les couleurs, polices, tailles
- Ajouter un logo d'entreprise
- Personnaliser les en-têtes et pieds de page

## Dépannage

### La caméra ne démarre pas
- Vérifier les permissions du navigateur
- Utiliser HTTPS (requis pour getUserMedia)
- Tester sur un autre navigateur

### L'OCR ne détecte rien
- Améliorer l'éclairage
- Maintenir la carte plus stable
- Nettoyer l'objectif de la caméra
- Ajuster les regex dans `extractCNIData()`

### Les données ne persistent pas
- Vérifier que IndexedDB est activé dans le navigateur
- Ne pas utiliser le mode navigation privée
- Vérifier l'espace de stockage disponible

## Sécurité et confidentialité

- Toutes les données restent sur l'appareil local
- Aucune transmission vers des serveurs externes
- Pas de connexion internet requise
- Les données peuvent être supprimées manuellement
- Conforme RGPD (données locales uniquement)

## Support

Pour toute question ou amélioration, consulter les commentaires dans le code source. Chaque fonction est documentée en détail.

---

**Guerite AI** - Système autonome de gestion intelligente des visiteurs
