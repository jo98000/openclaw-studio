# Roadmap — Refonte Persona & Directives

> Refonte complète du système de personnalité et directives d'agent.
> Objectif : studio ultra-performant, flow qui glisse, agents cohérents dès la création.
> Créée le 2026-03-02.

> **Status: 141/170 tâches (83%) — Phases 0-5 complètes, Phase 6 en cours.**
> Reste : i18n templates FR (6.1.6), audit strings (6.1.7), test migration (6.2.4), a11y avancée (6.3.3-5), perf (6.4.x), E2E (6.5.x), docs (6.6.x), cleanup legacy (6.7.1).
> Dernière mise à jour : 2026-03-02.

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Phase 0 — Architecture & Fondations](#phase-0--architecture--fondations)
- [Phase 1 — Templates Riches](#phase-1--templates-riches)
- [Phase 2 — Nouveau Wizard de Création (5 étapes)](#phase-2--nouveau-wizard-de-création-5-étapes)
- [Phase 3 — Constructeur Conversationnel IA](#phase-3--constructeur-conversationnel-ia)
- [Phase 4 — Panneau Brain Repensé](#phase-4--panneau-brain-repensé)
- [Phase 5 — Preview Live & Tests Comportementaux](#phase-5--preview-live--tests-comportementaux)
- [Phase 6 — Polish, i18n, Tests, Migration](#phase-6--polish-i18n-tests-migration)
- [Matrice des dépendances](#matrice-des-dépendances)
- [Fichiers impactés](#fichiers-impactés)

---

## Vue d'ensemble

```
AVANT (3 étapes, 7 fichiers, pas de persona à la création)
    ↓
APRÈS (5 étapes, 5 fichiers, persona au centre, preview live, builder IA)
```

| Phase | Nom                          | Impact      | Complexité |
| ----- | ---------------------------- | ----------- | ---------- |
| 0     | Architecture & Fondations    | Technique   | Moyenne    |
| 1     | Templates Riches             | UX immédiat | Faible     |
| 2     | Nouveau Wizard 5 étapes      | UX majeur   | Haute      |
| 3     | Constructeur Conversationnel | Innovation  | Haute      |
| 4     | Panneau Brain Repensé        | Power users | Moyenne    |
| 5     | Preview & Tests              | Validation  | Haute      |
| 6     | Polish & Finalisation        | Qualité     | Moyenne    |

---

## Phase 0 — Architecture & Fondations

> Consolider les fichiers, créer les types, préparer le terrain.
> Aucun changement visible côté UI — que de la plomberie.

### 0.1 — Consolidation des fichiers (7 → 5)

- [x] **0.1.1** Créer le nouveau mapping de fichiers
  - `SOUL.md` + `IDENTITY.md` → `PERSONA.md`
  - `AGENTS.md` + `TOOLS.md` → `DIRECTIVES.md`
  - `USER.md` reste tel quel
  - `HEARTBEAT.md` reste tel quel
  - `MEMORY.md` reste tel quel (bidirectionnel, l'agent y écrit)
  - Fichier : `src/lib/agents/agentFiles.ts`

- [x] **0.1.2** Mettre à jour `AGENT_FILE_NAMES` et les types associés
  - Nouveau : `["PERSONA.md", "DIRECTIVES.md", "USER.md", "HEARTBEAT.md", "MEMORY.md"]`
  - Mettre à jour `AgentFileName` type union
  - Mettre à jour `PERSONALITY_FILE_NAMES` → `["PERSONA.md", "DIRECTIVES.md", "USER.md"]`
  - Mettre à jour `PersonalityFileName` type
  - Mettre à jour `PERSONALITY_FILE_LABELS`
  - Fichier : `src/lib/agents/agentFiles.ts`

- [x] **0.1.3** Mettre à jour `AGENT_FILE_META` (titre + hint par fichier)
  - `PERSONA.md` : "Identity, personality, tone, and boundaries."
  - `DIRECTIVES.md` : "Operating instructions, priorities, rules, and tool conventions."
  - Garder USER, HEARTBEAT, MEMORY tels quels
  - Fichier : `src/lib/agents/agentFiles.ts`

- [x] **0.1.4** Mettre à jour `AGENT_FILE_PLACEHOLDERS`
  - Rédiger les nouveaux placeholders pour PERSONA.md et DIRECTIVES.md
  - Fichier : `src/lib/agents/agentFiles.ts`

- [x] **0.1.5** Mettre à jour `createAgentFilesState()` pour les 5 fichiers
  - Fichier : `src/lib/agents/agentFiles.ts`

### 0.2 — Refactor du PersonalityBuilder

- [x] **0.2.1** Nouveau type `PersonalityBuilderDraft` unifié

  ```typescript
  type PersonalityBuilderDraft = {
    persona: {
      // Depuis IDENTITY.md
      name: string;
      creature: string;
      emoji: string;
      avatar: string;
      // Depuis SOUL.md
      vibe: string;
      coreTruths: string;
      boundaries: string;
      continuity: string;
      // Nouveau : traits sous forme de spectre 0-100
      traits: {
        formality: number; // 0=casual, 100=formel
        verbosity: number; // 0=concis, 100=détaillé
        creativity: number; // 0=précis, 100=créatif
        proactivity: number; // 0=réactif, 100=proactif
        warmth: number; // 0=neutre, 100=chaleureux
      };
    };
    directives: {
      // Depuis AGENTS.md
      mission: string; // Mission principale (1-2 phrases)
      rules: string; // Règles opérationnelles (multi-ligne)
      priorities: string; // Priorités ordonnées
      outputFormat: string; // Format de sortie préféré
      // Depuis TOOLS.md
      toolNotes: string; // Notes sur les outils
    };
    user: {
      name: string;
      callThem: string;
      pronouns: string;
      timezone: string;
      notes: string;
      context: string;
    };
    heartbeat: string;
    memory: string;
  };
  ```

  - Fichier : `src/lib/agents/personalityBuilder.ts`

- [x] **0.2.2** Nouveau `parsePersonalityFiles()` pour le format 5 fichiers
  - Parser PERSONA.md (fusion des anciens SOUL + IDENTITY)
  - Parser DIRECTIVES.md (fusion des anciens AGENTS + TOOLS)
  - Parser les traits depuis les métadonnées ou les sections dédiées
  - Fichier : `src/lib/agents/personalityBuilder.ts`

- [x] **0.2.3** Nouveau `serializePersonalityFiles()` pour le format 5 fichiers
  - Sérialiser persona → PERSONA.md
  - Sérialiser directives → DIRECTIVES.md
  - Gérer les traits (convertir valeurs numériques en descriptions textuelles)
  - Fichier : `src/lib/agents/personalityBuilder.ts`

- [x] **0.2.4** Écrire la fonction de conversion des traits numériques en texte
  - `traitToText(dimension, value)` → "très formel" / "semi-formel" / "décontracté"
  - Mapping bidirectionnel : texte → valeur ET valeur → texte
  - Fichier : `src/lib/agents/personalityTraits.ts` (nouveau)

- [x] **0.2.5** Ajouter la rétrocompatibilité lecture (ancien format 7 fichiers)
  - `parseLegacyPersonalityFiles()` qui détecte l'ancien format
  - Auto-migration silencieuse : si SOUL.md + IDENTITY.md existent, les fusionner en PERSONA.md
  - Fichier : `src/lib/agents/personalityBuilder.ts`

### 0.3 — Mise à jour du Gateway File I/O

- [x] **0.3.1** Vérifier que le gateway accepte les nouveaux noms de fichiers
  - Tester `agents.files.set` avec "PERSONA.md" et "DIRECTIVES.md"
  - Si le gateway a une whitelist de noms, la mettre à jour côté gateway
  - Fichier : `src/lib/gateway/agentFiles.ts`

- [x] **0.3.2** Ajouter la logique de migration dans `readGatewayAgentFile`
  - Si PERSONA.md n'existe pas mais SOUL.md + IDENTITY.md existent → migrer
  - Si DIRECTIVES.md n'existe pas mais AGENTS.md + TOOLS.md existent → migrer
  - Fichier : `src/lib/gateway/agentFiles.ts`

- [x] **0.3.3** Mettre à jour `writeGatewayAgentFiles()` pour les 5 fichiers
  - Fichier : `src/lib/gateway/agentFiles.ts`

### 0.4 — Types & Payload de création

- [x] **0.4.1** Étendre `AgentCreateModalSubmitPayload` avec les données persona

  ```typescript
  type AgentCreateModalSubmitPayload = {
    name: string;
    avatarSeed?: string;
    templateId?: string;
    modelKey?: string;
    description?: string;
    capabilities?: { commandMode; webAccess; fileTools };
    // NOUVEAU
    persona?: {
      traits?: PersonalityTraits;
      coreTruths?: string;
      boundaries?: string;
      vibe?: string;
    };
    directives?: {
      mission?: string;
      rules?: string;
      priorities?: string;
      outputFormat?: string;
    };
    userContext?: {
      name?: string;
      pronouns?: string;
      timezone?: string;
      notes?: string;
    };
    creationMode?: "template" | "conversational" | "blank";
  };
  ```

  - Fichier : `src/features/agents/creation/types.ts`

- [x] **0.4.2** Mettre à jour le bootstrap operation pour écrire les fichiers persona
  - Après création de l'agent + permissions, écrire PERSONA.md + DIRECTIVES.md + USER.md
  - Utiliser `writeGatewayAgentFiles()` avec le contenu sérialisé
  - Fichier : `src/features/agents/operations/createAgentBootstrapOperation.ts`

- [x] **0.4.3** Mettre à jour le bootstrap workflow (commands)
  - Ajouter un command `write-persona-files` après `apply-permissions`
  - Fichier : `src/features/agents/operations/createAgentBootstrapWorkflow.ts`

### 0.5 — Tests unitaires Phase 0

- [x] **0.5.1** Tests pour le nouveau `parsePersonalityFiles()` (format 5 fichiers)
- [x] **0.5.2** Tests pour `serializePersonalityFiles()` (format 5 fichiers)
- [x] **0.5.3** Tests pour la migration legacy (7 → 5 fichiers)
- [x] **0.5.4** Tests pour `traitToText()` et `textToTrait()` bidirectionnel
- [x] **0.5.5** Tests pour le nouveau `AgentCreateModalSubmitPayload`
- [x] **0.5.6** Tests pour le bootstrap operation avec écriture persona

---

## Phase 1 — Templates Riches

> Chaque template embarque une personnalité complète pré-écrite.
> L'agent est utile et cohérent dès la création.

### 1.1 — Structure des templates enrichis

- [x] **1.1.1** Étendre le type `AgentTemplate` avec les champs persona

  ```typescript
  type AgentTemplate = {
    id: string;
    icon: string;
    defaultModel: string;
    capabilities: { commandMode; webAccess; fileTools };
    // NOUVEAU
    persona: {
      traits: PersonalityTraits;
      vibe: string;
      coreTruths: string;
      boundaries: string;
    };
    directives: {
      mission: string;
      rules: string;
      priorities: string;
      outputFormat: string;
    };
    suggestedUserContext?: {
      notes: string;
    };
  };
  ```

  - Fichier : `src/features/agents/templates/agentTemplates.ts`

- [x] **1.1.2** Créer un fichier de contenu par template (séparation données/code)
  - Fichier : `src/features/agents/templates/templatePersonalities.ts` (nouveau)
  - Contient les textes longs (coreTruths, rules, etc.) séparés du code

### 1.2 — Rédaction des personnalités (14 templates)

- [x] **1.2.1** Template `general` — Assistant généraliste
  - Traits : formality=40, verbosity=50, creativity=50, proactivity=60, warmth=70
  - Mission : "Assister l'utilisateur dans toutes ses tâches quotidiennes avec polyvalence et efficacité"
  - Vibe : polyvalent, amical, fiable

- [x] **1.2.2** Template `researcher` — Chercheur
  - Traits : formality=60, verbosity=70, creativity=40, proactivity=70, warmth=40
  - Mission : "Rechercher, analyser et synthétiser l'information avec rigueur et exhaustivité"
  - Vibe : méthodique, curieux, précis, cite toujours ses sources

- [x] **1.2.3** Template `coder` — Développeur
  - Traits : formality=30, verbosity=20, creativity=50, proactivity=80, warmth=30
  - Mission : "Écrire, débugger et optimiser du code avec excellence technique"
  - Vibe : concis, technique, code-first, explique seulement si demandé

- [x] **1.2.4** Template `writer` — Rédacteur
  - Traits : formality=50, verbosity=70, creativity=90, proactivity=40, warmth=60
  - Mission : "Rédiger du contenu créatif, engageant et adapté au public cible"
  - Vibe : créatif, éloquent, attentif au ton et au style

- [x] **1.2.5** Template `multimodal` — Multimodal
  - Traits : formality=40, verbosity=50, creativity=60, proactivity=50, warmth=50
  - Mission : "Traiter et analyser des contenus texte, image et audio avec fluidité"
  - Vibe : adaptable, visuel, descriptif

- [x] **1.2.6** Template `support` — Support Client
  - Traits : formality=60, verbosity=50, creativity=20, proactivity=70, warmth=90
  - Mission : "Résoudre les problèmes des utilisateurs avec empathie, rapidité et précision"
  - Vibe : patient, empathique, orienté solution, jamais condescendant

- [x] **1.2.7** Template `analyst` — Analyste Data
  - Traits : formality=70, verbosity=60, creativity=30, proactivity=60, warmth=30
  - Mission : "Analyser les données, identifier les tendances et produire des insights actionnables"
  - Vibe : rigoureux, factuel, structuré, toujours appuyé par les données

- [x] **1.2.8** Template `devops` — DevOps / Infra
  - Traits : formality=40, verbosity=30, creativity=30, proactivity=90, warmth=20
  - Mission : "Maintenir, automatiser et sécuriser l'infrastructure avec fiabilité"
  - Vibe : pragmatique, sécurité d'abord, automatise tout, alertes claires

- [x] **1.2.9** Template `social` — Social Media Manager
  - Traits : formality=20, verbosity=40, creativity=90, proactivity=80, warmth=80
  - Mission : "Créer du contenu social engageant, gérer la présence en ligne et analyser les métriques"
  - Vibe : tendance, punchy, connaît les codes de chaque plateforme

- [x] **1.2.10** Template `strategist` — Stratège
  - Traits : formality=70, verbosity=70, creativity=60, proactivity=50, warmth=40
  - Mission : "Élaborer des stratégies business basées sur l'analyse de marché et la vision long terme"
  - Vibe : visionnaire, structuré, pose les bonnes questions avant de répondre

- [x] **1.2.11** Template `sales` — Commercial
  - Traits : formality=50, verbosity=50, creativity=60, proactivity=90, warmth=80
  - Mission : "Accompagner le processus de vente de la prospection au closing avec persuasion et éthique"
  - Vibe : persuasif, orienté valeur, jamais agressif, écoute d'abord

- [x] **1.2.12** Template `assistant` — Assistant Personnel
  - Traits : formality=30, verbosity=40, creativity=40, proactivity=90, warmth=80
  - Mission : "Organiser, planifier et rappeler pour maximiser la productivité au quotidien"
  - Vibe : proactif, organisé, anticipe les besoins, ton familier

- [x] **1.2.13** Template `translator` — Traducteur
  - Traits : formality=60, verbosity=40, creativity=50, proactivity=30, warmth=40
  - Mission : "Traduire avec fidélité au sens, au ton et aux nuances culturelles"
  - Vibe : précis, culturellement sensible, préserve le registre

- [x] **1.2.14** Template `custom` — Custom (pas de personnalité par défaut)
  - Traits : tous à 50 (neutre)
  - Mission : vide (l'utilisateur remplit)
  - Vibe : "À configurer selon vos besoins"

### 1.3 — Intégration des templates dans le flow de création

- [x] **1.3.1** Mettre à jour `handleTemplateSelect()` dans AgentCreateModal
  - Quand un template est sélectionné, pré-remplir aussi les champs persona/directives
  - Fichier : `src/features/agents/components/AgentCreateModal.tsx`

- [x] **1.3.2** Mettre à jour le TemplateSelector avec preview de personnalité
  - Afficher un résumé de la persona sur hover/clic (mission + vibe en 1 ligne)
  - Fichier : `src/features/agents/components/AgentCreateModal.tsx`

- [x] **1.3.3** Mettre à jour le bootstrap pour écrire les fichiers template
  - Lors de la création avec template, sérialiser la persona du template dans les fichiers
  - Fichier : `src/features/agents/operations/createAgentBootstrapOperation.ts`

### 1.4 — Tests Phase 1

- [x] **1.4.1** Test que chaque template a une personnalité complète et valide
- [x] **1.4.2** Test que `handleTemplateSelect()` pré-remplit les données persona
- [x] **1.4.3** Test que le bootstrap écrit les fichiers persona pour chaque template
- [x] **1.4.4** Test E2E : créer un agent avec template → vérifier que les fichiers persona existent

---

## Phase 2 — Nouveau Wizard de Création (5 étapes)

> Le wizard passe de 3 à 5 étapes avec la persona au centre.
> Flow : Point de départ → Identité → Persona & Directives → Modèle → Capabilities

### 2.1 — Étape 0 : Sélecteur de point de départ (nouveau)

- [x] **2.1.1** Composant `CreationModeSelector`
  - 3 cartes : Template / Describe (IA) / Blank Canvas
  - Chaque carte avec icône, titre, description
  - Fichier : `src/features/agents/components/creation/CreationModeSelector.tsx` (nouveau)

- [x] **2.1.2** State `creationMode` dans le wizard
  - `"template" | "conversational" | "blank"`
  - Conditionne le flow des étapes suivantes
  - Fichier : `src/features/agents/components/AgentCreateModal.tsx`

- [x] **2.1.3** Routing conditionnel des étapes selon le mode
  - Template : Étape 0 → 1 (avec TemplateSelector) → 2 (pré-rempli) → 3 → 4
  - Conversational : Étape 0 → Chat Builder → 2 (généré par IA) → 3 → 4
  - Blank : Étape 0 → 1 (sans template) → 2 (vide) → 3 → 4

### 2.2 — Étape 1 : Identité (améliorée)

- [x] **2.2.1** Refactorer l'étape 1 existante en composant isolé
  - Fichier : `src/features/agents/components/creation/StepIdentity.tsx` (nouveau)
  - Extraire depuis AgentCreateModal.tsx

- [x] **2.2.2** Ajouter le sélecteur d'archétype visuel
  - Grille de "creature types" avec icônes : Robot, Familiar, Ghost, Oracle, Companion...
  - Optionnel — sert de graine pour la personnalité
  - Fichier : `src/features/agents/components/creation/StepIdentity.tsx`

- [x] **2.2.3** Intégrer le TemplateSelector dans cette étape (mode template)
  - Le TemplateSelector n'est visible que si `creationMode === "template"`

### 2.3 — Étape 2 : Persona & Directives (NOUVEAU — le coeur)

- [x] **2.3.1** Composant `StepPersona` — conteneur principal
  - 4 sections collapsibles : Personality DNA / Mission & Règles / Limites / Contexte
  - Pré-rempli par le template (si mode template) ou par l'IA (si mode conversational)
  - Fichier : `src/features/agents/components/creation/StepPersona.tsx` (nouveau)

- [x] **2.3.2** Sous-composant `PersonalityTraitSliders`
  - 5 sliders : Formality, Verbosity, Creativity, Proactivity, Warmth
  - Labels dynamiques selon la valeur ("Très formel" / "Semi-formel" / "Décontracté")
  - Feedback visuel en temps réel (couleur, icône)
  - Fichier : `src/features/agents/components/creation/PersonalityTraitSliders.tsx` (nouveau)

- [x] **2.3.3** Sous-composant `CoreTruthsEditor`
  - Textarea multi-ligne pour les Core Truths
  - Placeholder contextuel basé sur le template
  - Compteur de caractères
  - Fichier : `src/features/agents/components/creation/CoreTruthsEditor.tsx` (nouveau)

- [x] **2.3.4** Sous-composant `BoundariesEditor`
  - Liste de règles avec ajout/suppression
  - Chaque règle = input avec bouton supprimer
  - Bouton "Ajouter une limite"
  - Suggestions contextuelles basées sur le template
  - Fichier : `src/features/agents/components/creation/BoundariesEditor.tsx` (nouveau)

- [x] **2.3.5** Sous-composant `MissionEditor`
  - Input pour la mission principale (1-2 phrases max)
  - Textarea pour les règles opérationnelles
  - Input pour les priorités (liste ordonnée drag-and-drop ou numérotée)
  - Sélecteur de format de sortie (texte libre / structuré / code / mixte)
  - Fichier : `src/features/agents/components/creation/MissionEditor.tsx` (nouveau)

- [x] **2.3.6** Sous-composant `UserContextEditor`
  - Champs : nom, pronoms, timezone (auto-détect), notes
  - Textarea pour le contexte libre
  - Préremplissage depuis le profil utilisateur global (si disponible)
  - Fichier : `src/features/agents/components/creation/UserContextEditor.tsx` (nouveau)

- [x] **2.3.7** Toggle "Mode Expert" dans l'étape 2
  - Bascule entre le formulaire structuré et l'éditeur markdown brut
  - Synchronisation bidirectionnelle : form ↔ markdown
  - Fichier : `src/features/agents/components/creation/StepPersona.tsx`

### 2.4 — Étape 3 : Modèle & Intelligence (existant, déplacé)

- [x] **2.4.1** Extraire l'étape modèle en composant isolé
  - Fichier : `src/features/agents/components/creation/StepModel.tsx` (nouveau)
  - Extraire depuis AgentCreateModal.tsx

- [x] **2.4.2** Ajouter le sélecteur de thinking level
  - Off / Low / Medium / High
  - Hint contextuel : "Recommandé pour les tâches complexes"

- [x] **2.4.3** Suggestion de modèle basée sur le template
  - Afficher "Recommandé pour ce type d'agent : Claude Opus" avec highlight

### 2.5 — Étape 4 : Capabilities (existant, déplacé)

- [x] **2.5.1** Extraire l'étape capabilities en composant isolé
  - Fichier : `src/features/agents/components/creation/StepCapabilities.tsx` (nouveau)
  - Extraire depuis AgentCreateModal.tsx

- [x] **2.5.2** Ajouter les presets de rôle (Conservative / Collaborative / Autonomous)
  - 3 cartes radio avec description de chaque rôle
  - Pré-sélectionné selon le template
  - Les toggles individuels restent pour customisation fine

### 2.6 — Refactor du wizard principal

- [x] **2.6.1** Passer `WizardStep` de `0 | 1 | 2` à `0 | 1 | 2 | 3 | 4`
  - Nouveau flow : 0=Mode, 1=Identity, 2=Persona, 3=Model, 4=Capabilities
  - Fichier : `src/features/agents/components/AgentCreateModal.tsx`

- [x] **2.6.2** Mettre à jour le `StepIndicator` pour 5 étapes
  - Labels : Mode → Identité → Persona → Modèle → Capabilities
  - Design responsive (les labels se tronquent en mobile)
  - Fichier : `src/features/agents/components/AgentCreateModal.tsx`

- [x] **2.6.3** Orchestration du state global du wizard
  - Centraliser tout le state de création dans un `useCreateAgentWizard()` hook
  - Fichier : `src/features/agents/hooks/useCreateAgentWizard.ts` (nouveau)

- [x] **2.6.4** Mettre à jour `handleSubmit()` pour inclure les données persona
  - Construire le payload complet avec traits, mission, rules, etc.
  - Fichier : `src/features/agents/components/AgentCreateModal.tsx`

- [x] **2.6.5** Validation par étape
  - Étape 0 : mode sélectionné
  - Étape 1 : nom non vide
  - Étape 2 : au moins mission OU coreTruths rempli (pas obligatoire, encouragé)
  - Étape 3 : modèle sélectionné (ou default)
  - Étape 4 : rien de bloquant
  - Fichier : `src/features/agents/hooks/useCreateAgentWizard.ts`

### 2.7 — Tests Phase 2

- [x] **2.7.1** Tests unitaires pour chaque sous-composant de StepPersona
- [x] **2.7.2** Tests unitaires pour PersonalityTraitSliders (valeurs limites, labels)
- [x] **2.7.3** Tests unitaires pour useCreateAgentWizard hook
- [x] **2.7.4** Tests unitaires pour la validation par étape
- [x] **2.7.5** Test E2E : parcourir les 5 étapes en mode template
- [x] **2.7.6** Test E2E : parcourir les 5 étapes en mode blank
- [x] **2.7.7** Test E2E : vérifier que la persona est écrite dans les fichiers après création

---

## Phase 3 — Constructeur Conversationnel IA

> "Décris l'agent que tu veux" → l'IA génère la persona complète.
> L'utilisateur review et ajuste dans le wizard structuré.

### 3.1 — Prompt système du meta-agent persona builder

- [x] **3.1.1** Rédiger le system prompt du persona builder
  - Input : description libre de l'utilisateur
  - Output : JSON structuré avec tous les champs PersonalityBuilderDraft
  - Inclure des few-shot examples pour chaque type d'agent
  - Fichier : `src/features/agents/creation/personaBuilderPrompt.ts` (nouveau)

- [x] **3.1.2** Définir le format de sortie JSON attendu
  - Schema JSON strict avec validation
  - Fallback si le LLM ne respecte pas le format
  - Fichier : `src/features/agents/creation/personaBuilderSchema.ts` (nouveau)

- [x] **3.1.3** Itérer et tester le prompt sur 10+ cas d'usage
  - Agent support, coder, writer, analyst, multilingue, niche
  - Vérifier la qualité et la cohérence des personas générées
  - Documenter les résultats dans `docs/persona-builder-qa.md`

### 3.2 — UI du constructeur conversationnel

- [x] **3.2.1** Composant `ConversationalBuilder`
  - Textarea pour la description libre
  - Bouton "Générer"
  - État de chargement (spinner, texte "Analyse en cours...")
  - Fichier : `src/features/agents/components/creation/ConversationalBuilder.tsx` (nouveau)

- [x] **3.2.2** Affichage du résultat généré
  - Résumé visuel : nom suggéré, modèle recommandé, traits, mission, limites
  - Boutons "Affiner" (relancer avec feedback) / "Voir le détail" / "Continuer"
  - Fichier : `src/features/agents/components/creation/ConversationalBuilder.tsx`

- [x] **3.2.3** Mode "Affiner" — conversation multi-tour
  - L'utilisateur peut donner du feedback : "Plus formel", "Ajoute des limites sur..."
  - L'IA régénère en tenant compte du feedback
  - Maximum 3 tours de raffinement
  - Fichier : `src/features/agents/components/creation/ConversationalBuilder.tsx`

### 3.3 — Backend / API du constructeur

- [x] **3.3.1** Route API pour la génération de persona
  - `POST /api/persona-builder`
  - Input : `{ description: string, feedback?: string, previousDraft?: PersonalityBuilderDraft }`
  - Output : `PersonalityBuilderDraft`
  - Fichier : `src/app/api/persona-builder/route.ts` (nouveau)

- [x] **3.3.2** Logique d'appel LLM côté serveur
  - Utiliser le modèle configuré dans le gateway OU un modèle par défaut
  - Streaming pour le feedback en temps réel (optionnel, bonus)
  - Timeout et retry logic
  - Fichier : `src/app/api/persona-builder/route.ts`

- [x] **3.3.3** Validation et sanitization du résultat
  - Vérifier que le JSON retourné est conforme au schema
  - Sanitizer les contenus (pas d'injection, pas de contenu dangereux)
  - Fallback sur un template par défaut si échec
  - Fichier : `src/app/api/persona-builder/route.ts`

### 3.4 — Intégration dans le wizard

- [x] **3.4.1** Quand `creationMode === "conversational"`, remplacer l'étape 1 par le builder
  - Le builder remplace le TemplateSelector
  - Après génération, passer automatiquement à l'étape 2 (pré-remplie)
  - Fichier : `src/features/agents/components/AgentCreateModal.tsx`

- [x] **3.4.2** Pré-remplir l'étape 2 (Persona) avec le résultat du builder
  - Traits, mission, rules, boundaries → tous pré-remplis
  - L'utilisateur peut ajuster via le formulaire structuré
  - Fichier : `src/features/agents/hooks/useCreateAgentWizard.ts`

- [x] **3.4.3** Pré-sélectionner le modèle suggéré par l'IA à l'étape 3
  - Le builder recommande un modèle → pré-sélectionné mais modifiable
  - Fichier : `src/features/agents/components/creation/StepModel.tsx`

### 3.5 — Tests Phase 3

- [x] **3.5.1** Tests unitaires pour le prompt builder (format de sortie)
- [x] **3.5.2** Tests unitaires pour la validation du schema JSON
- [x] **3.5.3** Tests unitaires pour ConversationalBuilder (états, interactions)
- [x] **3.5.4** Test d'intégration : description → génération → remplissage wizard
- [x] **3.5.5** Test E2E : flow complet mode conversationnel

---

## Phase 4 — Panneau Brain Repensé

> Le panneau d'inspection avancé (AgentInspectPanels.tsx) passe
> d'un éditeur markdown brut à un éditeur structuré + mode expert.

### 4.1 — Vue structurée (formulaire)

- [x] **4.1.1** Nouveau composant `BrainPanelStructured`
  - Réutilise les sous-composants de l'étape 2 du wizard
  - PersonalityTraitSliders, CoreTruthsEditor, BoundariesEditor, MissionEditor
  - Sauvegarde automatique (debounced) ou bouton Save
  - Fichier : `src/features/agents/components/brain/BrainPanelStructured.tsx` (nouveau)

- [x] **4.1.2** Réutilisation des composants du wizard
  - Les composants PersonalityTraitSliders, etc. doivent être réutilisables
  - Les extraire dans un dossier partagé si nécessaire
  - Dossier : `src/features/agents/components/persona/` (nouveau, partagé)

- [x] **4.1.3** Synchronisation state formulaire ↔ fichiers gateway
  - Lecture : `readGatewayAgentFile` → `parsePersonalityFiles` → formulaire
  - Écriture : formulaire → `serializePersonalityFiles` → `writeGatewayAgentFiles`
  - Diff-aware : ne sauvegarder que les fichiers modifiés
  - Fichier : `src/features/agents/hooks/useAgentBrainEditor.ts` (nouveau)

### 4.2 — Mode Expert (markdown brut)

- [x] **4.2.1** Toggle "Mode Expert" dans le panneau Brain
  - Switch entre vue structurée et éditeur markdown brut
  - Persister la préférence dans les settings locaux
  - Fichier : `src/features/agents/components/brain/BrainPanelToggle.tsx` (nouveau)

- [x] **4.2.2** Éditeur markdown amélioré
  - Syntax highlighting pour les sections markdown (##, -, \*)
  - Numéros de ligne
  - Auto-resize du textarea
  - Fichier : `src/features/agents/components/brain/MarkdownEditor.tsx` (nouveau)

- [x] **4.2.3** Synchronisation bidirectionnelle form ↔ markdown
  - Quand on switch de mode, les changements sont préservés
  - Le markdown est parsé → formulaire et inversement
  - Gestion des conflits si le markdown contient du contenu non-structuré
  - Fichier : `src/features/agents/hooks/useAgentBrainEditor.ts`

### 4.3 — Radar de personnalité

- [x] **4.3.1** Composant `PersonalityRadar`
  - Graphique radar/spider chart avec les 5 dimensions de traits
  - Rendu SVG ou Canvas (pas de lib externe si possible, sinon recharts)
  - Responsive, s'adapte au panneau latéral
  - Fichier : `src/features/agents/components/persona/PersonalityRadar.tsx` (nouveau)

- [x] **4.3.2** Intégration dans le panneau Brain
  - Affiché en haut du panneau structuré comme résumé visuel
  - Interactif : cliquer sur un point pour modifier le trait
  - Fichier : `src/features/agents/components/brain/BrainPanelStructured.tsx`

- [x] **4.3.3** Comparaison avant/après
  - Quand des modifications non sauvegardées existent, afficher le radar en superposition
  - Ancien = contour gris pointillé, nouveau = contour couleur plein
  - Fichier : `src/features/agents/components/persona/PersonalityRadar.tsx`

### 4.4 — Validateur IA de cohérence

- [x] **4.4.1** Route API pour la validation de persona
  - `POST /api/persona-validator`
  - Input : `PersonalityBuilderDraft` complet
  - Output : `{ issues: Array<{ severity: "warning" | "error", message: string, field: string }> }`
  - Fichier : `src/app/api/persona-validator/route.ts` (nouveau)

- [x] **4.4.2** Prompt de validation
  - Détecter les contradictions entre mission et limites
  - Détecter les traits incohérents (ex: warmth=100 + formality=100 = tension)
  - Suggérer des améliorations
  - Fichier : `src/features/agents/creation/personaValidatorPrompt.ts` (nouveau)

- [x] **4.4.3** Affichage des issues dans le panneau Brain
  - Bannière d'alerte en haut du panneau si des issues existent
  - Chaque issue cliquable → scroll vers le champ concerné
  - Bouton "Valider la cohérence" pour lancer manuellement
  - Fichier : `src/features/agents/components/brain/PersonaValidationBanner.tsx` (nouveau)

- [x] **4.4.4** Validation automatique à la sauvegarde (optionnel)
  - Déclencher la validation quand l'utilisateur sauvegarde
  - Avertissement non bloquant (l'utilisateur peut ignorer)

### 4.5 — Refactor du AgentInspectPanels.tsx existant

- [x] **4.5.1** Extraire AgentBrainPanel en composant séparé
  - Le fichier fait 1938 lignes — le brain panel doit être autonome
  - Fichier : `src/features/agents/components/brain/AgentBrainPanel.tsx` (nouveau)

- [x] **4.5.2** Remplacer l'ancien éditeur de fichiers par le nouveau
  - L'ancien : boucle sur AGENT_FILE_NAMES avec textarea brut par fichier
  - Le nouveau : BrainPanelStructured (défaut) + toggle Mode Expert
  - Fichier : `src/features/agents/components/AgentInspectPanels.tsx`

- [x] **4.5.3** Mettre à jour le hook `useAgentFilesEditor`
  - Utiliser le nouveau format 5 fichiers
  - Intégrer la logique de migration legacy
  - Fichier : `src/features/agents/components/AgentInspectPanels.tsx` (hook interne)

### 4.6 — Tests Phase 4

- [x] **4.6.1** Tests unitaires pour BrainPanelStructured
- [x] **4.6.2** Tests unitaires pour PersonalityRadar (rendu SVG, données)
- [x] **4.6.3** Tests unitaires pour la synchronisation form ↔ markdown
- [x] **4.6.4** Tests unitaires pour le validateur de persona
- [x] **4.6.5** Test E2E : modifier un trait dans le panneau Brain → vérifier sauvegarde

---

## Phase 5 — Preview Live & Tests Comportementaux

> Voir comment l'agent se comporte AVANT de le créer.
> Valider que la persona "fonctionne" avec des tests automatiques.

### 5.1 — Preview de conversation

- [x] **5.1.1** Composant `PersonaPreview`
  - Split-pane : résumé agent à gauche, chat simulé à droite
  - 3 prompts de test automatiques basés sur le type d'agent
  - Fichier : `src/features/agents/components/creation/PersonaPreview.tsx` (nouveau)

- [x] **5.1.2** Génération des prompts de test
  - Par type d'agent : "Qui es-tu ?", prompt métier, prompt limite
  - Ex pour coder : "Qui es-tu ?" / "Écris une fonction Fibonacci" / "Peux-tu m'écrire un email ?"
  - Fichier : `src/features/agents/creation/previewPrompts.ts` (nouveau)

- [x] **5.1.3** Appel LLM pour la preview
  - Route API : `POST /api/persona-preview`
  - Input : persona complète + prompt de test
  - Output : réponse simulée de l'agent
  - Streaming pour l'UX de "l'agent qui répond"
  - Fichier : `src/app/api/persona-preview/route.ts` (nouveau)

- [x] **5.1.4** Affichage des réponses simulées
  - Style chat (bulles de conversation)
  - Indicateur "Ceci est une preview, pas une vraie conversation"
  - Bouton "Relancer avec un autre prompt"
  - Fichier : `src/features/agents/components/creation/PersonaPreview.tsx`

### 5.2 — Intégration de la preview dans le wizard

- [x] **5.2.1** Ajouter la preview comme étape 5 (optionnelle) du wizard
  - Accessible via bouton "Preview" à l'étape 4 (avant la création)
  - OU comme étape finale avant le bouton "Créer l'agent"
  - Fichier : `src/features/agents/components/AgentCreateModal.tsx`

- [x] **5.2.2** Résumé visuel de l'agent dans la preview
  - Carte récapitulative : nom, modèle, traits (radar mini), mission
  - Indicateurs visuels : nombre de limites, rôle de permission
  - Fichier : `src/features/agents/components/creation/AgentSummaryCard.tsx` (nouveau)

### 5.3 — Suite de tests comportementaux

- [x] **5.3.1** Définir les catégories de tests
  - **Ton** : Vérifie que le style de communication correspond aux traits
  - **Limites** : Vérifie que l'agent respecte ses boundaries
  - **Expertise** : Vérifie que l'agent répond dans son domaine
  - **Format** : Vérifie que le format de sortie est respecté
  - **Identité** : Vérifie que l'agent sait qui il est

- [x] **5.3.2** Composant `PersonaTestSuite`
  - Liste de tests avec indicateur pass/fail/pending
  - Bouton "Lancer tous les tests"
  - Résultat par test : prompt envoyé, réponse reçue, verdict
  - Fichier : `src/features/agents/components/testing/PersonaTestSuite.tsx` (nouveau)

- [x] **5.3.3** Route API pour l'évaluation des tests
  - `POST /api/persona-test`
  - Input : persona + prompt de test + critères d'évaluation
  - Output : `{ pass: boolean, score: number, explanation: string }`
  - L'évaluation est faite par un LLM-juge
  - Fichier : `src/app/api/persona-test/route.ts` (nouveau)

- [x] **5.3.4** Intégration dans le panneau Brain (post-création)
  - Tab "Tests" dans le panneau d'inspection
  - Lancer les tests à tout moment pour vérifier la persona
  - Historique des résultats de tests

### 5.4 — Tests Phase 5

- [x] **5.4.1** Tests unitaires pour la génération de prompts de test
- [x] **5.4.2** Tests unitaires pour PersonaPreview (rendu, états)
- [x] **5.4.3** Tests unitaires pour PersonaTestSuite (rendu, états)
- [x] **5.4.4** Test d'intégration : preview → réponse simulée cohérente
- [x] **5.4.5** Test E2E : flow complet avec preview avant création

---

## Phase 6 — Polish, i18n, Tests, Migration

> Tout finir proprement. Rien n'est oublié.

### 6.1 — Internationalisation (i18n)

- [x] **6.1.1** Ajouter les clés i18n pour l'étape 0 (mode selector)
  - `messages/en.json` : section `createAgent.mode.*`
  - `messages/fr.json` : traductions françaises
  - Clés : `modeTitle`, `modeTemplate`, `modeTemplateDesc`, `modeConversational`, `modeConversationalDesc`, `modeBlank`, `modeBlankDesc`

- [x] **6.1.2** Ajouter les clés i18n pour l'étape 2 (persona)
  - Section `createAgent.persona.*`
  - Clés : `sectionPersonality`, `sectionMission`, `sectionBoundaries`, `sectionContext`
  - Labels des sliders : `traitFormality`, `traitVerbosity`, `traitCreativity`, `traitProactivity`, `traitWarmth`
  - Labels des valeurs de slider : `traitVeryLow`, `traitLow`, `traitMedium`, `traitHigh`, `traitVeryHigh`

- [x] **6.1.3** Ajouter les clés i18n pour le constructeur conversationnel
  - Section `createAgent.conversational.*`
  - Clés : `placeholder`, `generate`, `generating`, `result`, `refine`, `seeDetail`, `continue`

- [x] **6.1.4** Ajouter les clés i18n pour le panneau Brain repensé
  - Section `inspect.brain.*`
  - Clés : `structured`, `expert`, `validate`, `validating`, `noIssues`, `issuesFound`

- [x] **6.1.5** Ajouter les clés i18n pour la preview et les tests
  - Section `createAgent.preview.*` et `inspect.tests.*`

- [ ] **6.1.6** Traduire les personnalités des 14 templates en FR
  - Fichier : `src/features/agents/templates/templatePersonalities.ts`
  - Utiliser `useTranslations("templatePersonalities")` ou intégrer dans les messages JSON

- [ ] **6.1.7** Vérifier que TOUS les textes hardcodés sont passés par i18n
  - Grep pour les strings hardcodées en français/anglais dans les nouveaux composants
  - Aucun texte visible ne doit être en dur

### 6.2 — Migration des agents existants

- [x] **6.2.1** Script de migration automatique
  - Quand un agent avec l'ancien format (7 fichiers) est ouvert :
    1. Lire SOUL.md + IDENTITY.md → fusionner en PERSONA.md
    2. Lire AGENTS.md + TOOLS.md → fusionner en DIRECTIVES.md
    3. Écrire les nouveaux fichiers
    4. (Optionnel) Supprimer les anciens fichiers
  - Fichier : `src/lib/agents/migrateLegacyFiles.ts` (nouveau)

- [x] **6.2.2** Trigger de migration transparent
  - La migration se déclenche quand `useAgentFilesEditor` détecte l'ancien format
  - Silencieuse, pas de modal ou d'interruption pour l'utilisateur
  - Log de la migration dans la console pour debug
  - Fichier : `src/features/agents/hooks/useAgentBrainEditor.ts`

- [x] **6.2.3** Backward compatibility pendant la période de transition
  - Supporter la lecture des deux formats pendant N semaines
  - Le parseur détecte automatiquement quel format est utilisé
  - Fichier : `src/lib/agents/personalityBuilder.ts`

- [ ] **6.2.4** Tester la migration sur des agents existants
  - Créer des agents de test avec l'ancien format
  - Vérifier que la migration produit le bon résultat
  - Vérifier qu'aucune donnée n'est perdue

### 6.3 — Accessibilité (a11y)

- [x] **6.3.1** ARIA labels pour les sliders de traits
  - `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`
  - Navigation clavier (flèches gauche/droite)
  - Fichier : tous les composants de slider

- [x] **6.3.2** ARIA labels pour le radar de personnalité
  - Texte alternatif décrivant les traits
  - `role="img"` avec `aria-label` descriptif

- [ ] **6.3.3** Navigation clavier dans le wizard
  - Tab order logique entre les étapes
  - Enter pour avancer, Escape pour fermer
  - Focus trap dans la modale

- [ ] **6.3.4** Contraste et taille des textes
  - Vérifier WCAG 2.1 AA sur tous les nouveaux composants
  - Les labels de slider doivent avoir un contraste suffisant

- [ ] **6.3.5** Screen reader testing
  - Tester avec VoiceOver (macOS) sur le flow complet de création

### 6.4 — Performance

- [ ] **6.4.1** Lazy loading des étapes du wizard
  - Les étapes 2+ ne sont rendues que quand l'utilisateur y arrive
  - `React.lazy()` pour les composants lourds (radar, preview)

- [ ] **6.4.2** Debounce des sauvegardes dans le panneau Brain
  - 500ms de debounce sur les modifications
  - Indicateur "Saving..." / "Saved" dans le header

- [ ] **6.4.3** Optimisation des appels LLM
  - Cache des previews (même persona → même résultat pendant 5 min)
  - Annulation des requêtes en cours si l'utilisateur navigue

- [ ] **6.4.4** Bundle size impact
  - Vérifier que les nouveaux composants n'augmentent pas le bundle de plus de 15%
  - Le radar SVG doit être inline, pas une lib externe

### 6.5 — Tests finaux

- [ ] **6.5.1** Test E2E complet : mode template (5 étapes → agent fonctionnel)
- [ ] **6.5.2** Test E2E complet : mode conversationnel (description → agent fonctionnel)
- [ ] **6.5.3** Test E2E complet : mode blank (toutes les étapes vides → agent minimal)
- [ ] **6.5.4** Test E2E : migration d'un agent ancien format → nouveau format
- [ ] **6.5.5** Test E2E : panneau Brain structuré → modifier → sauvegarder → vérifier
- [ ] **6.5.6** Test E2E : panneau Brain expert → modifier markdown → sauvegarder → vérifier
- [ ] **6.5.7** Test E2E : validateur de persona → détecter une contradiction
- [ ] **6.5.8** Test E2E : preview → lancer les 3 prompts de test → vérifier les réponses
- [ ] **6.5.9** Test de non-régression : créer un agent sans personnaliser la persona → ça marche
- [ ] **6.5.10** Test de non-régression : les agents existants continuent de fonctionner
- [ ] **6.5.11** Test mobile : le wizard est utilisable sur petit écran
- [ ] **6.5.12** Test de charge : créer 10 agents en séquence sans erreur

### 6.6 — Documentation

- [ ] **6.6.1** Mettre à jour `ARCHITECTURE.md` avec le nouveau système de fichiers
- [ ] **6.6.2** Mettre à jour `docs/ui-guide.md` avec les nouveaux flows
- [ ] **6.6.3** Documenter l'API `/api/persona-builder` (input/output)
- [ ] **6.6.4** Documenter l'API `/api/persona-validator` (input/output)
- [ ] **6.6.5** Documenter l'API `/api/persona-preview` (input/output)
- [ ] **6.6.6** Ajouter des commentaires JSDoc sur les types clés
  - `PersonalityBuilderDraft`, `PersonalityTraits`, `AgentTemplate` étendu

### 6.7 — Nettoyage

- [ ] **6.7.1** Supprimer le code legacy une fois la migration terminée
  - Anciens parseurs SOUL.md / IDENTITY.md séparés
  - Anciens sérialiseurs
  - Anciens types si plus utilisés

- [x] **6.7.2** Supprimer le fichier `AgentInspectPanels.tsx.bak` (dans git status)

- [x] **6.7.3** Vérifier qu'aucun import mort ne traîne

- [x] **6.7.4** Linter + formatter sur tous les fichiers modifiés

---

## Matrice des dépendances

```
Phase 0 (Fondations)
  ├── Phase 1 (Templates Riches) ← dépend de 0.1 + 0.2
  │     └── Phase 2 (Wizard 5 étapes) ← dépend de 1.1 + 1.3
  │           ├── Phase 3 (Builder IA) ← dépend de 2.3 + 2.6
  │           └── Phase 5 (Preview) ← dépend de 2.3
  └── Phase 4 (Brain Panel) ← dépend de 0.1 + 0.2
        └── Phase 5 (Tests) ← dépend de 4.1

Phase 6 (Polish) ← dépend de TOUTES les phases précédentes
```

**Chemin critique :** Phase 0 → Phase 1 → Phase 2 → Phase 3

**Parallélisable :**

- Phase 4 peut commencer dès que Phase 0 est terminée (en parallèle de Phase 1+2)
- Phase 1.2 (rédaction des personnalités) peut commencer immédiatement (pas de dépendance code)
- Phase 6.1 (i18n) peut être incrémentale (ajouter les clés au fur et à mesure)

---

## Fichiers impactés

### Fichiers existants à modifier

| Fichier                                                           | Phase | Nature du changement                         |
| ----------------------------------------------------------------- | ----- | -------------------------------------------- |
| `src/lib/agents/agentFiles.ts`                                    | 0     | Refonte complète (7→5 fichiers)              |
| `src/lib/agents/personalityBuilder.ts`                            | 0     | Refonte complète (nouveaux types + parseurs) |
| `src/features/agents/templates/agentTemplates.ts`                 | 1     | Extension du type + données persona          |
| `src/features/agents/components/AgentCreateModal.tsx`             | 2     | Refonte majeure (3→5 étapes + modes)         |
| `src/features/agents/creation/types.ts`                           | 0     | Extension du payload                         |
| `src/features/agents/operations/createAgentBootstrapOperation.ts` | 0     | Ajout écriture fichiers persona              |
| `src/features/agents/operations/createAgentBootstrapWorkflow.ts`  | 0     | Nouveau command `write-persona-files`        |
| `src/features/agents/components/AgentInspectPanels.tsx`           | 4     | Remplacement de l'éditeur Brain              |
| `src/lib/gateway/agentFiles.ts`                                   | 0     | Migration + nouveaux noms                    |
| `messages/en.json`                                                | 6     | Nouvelles clés i18n                          |
| `messages/fr.json`                                                | 6     | Nouvelles clés i18n                          |
| `docs/ARCHITECTURE.md`                                            | 6     | Mise à jour documentation                    |
| `docs/ui-guide.md`                                                | 6     | Mise à jour documentation                    |

### Nouveaux fichiers à créer

| Fichier                                                               | Phase | Rôle                                 |
| --------------------------------------------------------------------- | ----- | ------------------------------------ |
| `src/lib/agents/personalityTraits.ts`                                 | 0     | Conversion traits numériques ↔ texte |
| `src/lib/agents/migrateLegacyFiles.ts`                                | 6     | Migration 7→5 fichiers               |
| `src/features/agents/templates/templatePersonalities.ts`              | 1     | Contenu des personnalités templates  |
| `src/features/agents/hooks/useCreateAgentWizard.ts`                   | 2     | State centralisé du wizard           |
| `src/features/agents/hooks/useAgentBrainEditor.ts`                    | 4     | State de l'éditeur Brain             |
| `src/features/agents/components/creation/CreationModeSelector.tsx`    | 2     | Sélecteur mode de création           |
| `src/features/agents/components/creation/StepIdentity.tsx`            | 2     | Étape 1 isolée                       |
| `src/features/agents/components/creation/StepPersona.tsx`             | 2     | Étape 2 — persona                    |
| `src/features/agents/components/creation/StepModel.tsx`               | 2     | Étape 3 — modèle                     |
| `src/features/agents/components/creation/StepCapabilities.tsx`        | 2     | Étape 4 — capabilities               |
| `src/features/agents/components/creation/PersonalityTraitSliders.tsx` | 2     | Sliders de traits                    |
| `src/features/agents/components/creation/CoreTruthsEditor.tsx`        | 2     | Éditeur Core Truths                  |
| `src/features/agents/components/creation/BoundariesEditor.tsx`        | 2     | Éditeur de limites                   |
| `src/features/agents/components/creation/MissionEditor.tsx`           | 2     | Éditeur de mission                   |
| `src/features/agents/components/creation/UserContextEditor.tsx`       | 2     | Éditeur contexte user                |
| `src/features/agents/components/creation/ConversationalBuilder.tsx`   | 3     | Builder conversationnel              |
| `src/features/agents/components/creation/PersonaPreview.tsx`          | 5     | Preview live                         |
| `src/features/agents/components/creation/AgentSummaryCard.tsx`        | 5     | Carte résumé                         |
| `src/features/agents/components/persona/PersonalityRadar.tsx`         | 4     | Radar chart SVG                      |
| `src/features/agents/components/brain/AgentBrainPanel.tsx`            | 4     | Brain panel extrait                  |
| `src/features/agents/components/brain/BrainPanelStructured.tsx`       | 4     | Vue structurée                       |
| `src/features/agents/components/brain/BrainPanelToggle.tsx`           | 4     | Toggle structuré/expert              |
| `src/features/agents/components/brain/MarkdownEditor.tsx`             | 4     | Éditeur markdown amélioré            |
| `src/features/agents/components/brain/PersonaValidationBanner.tsx`    | 4     | Bannière de validation               |
| `src/features/agents/components/testing/PersonaTestSuite.tsx`         | 5     | Suite de tests                       |
| `src/features/agents/creation/personaBuilderPrompt.ts`                | 3     | Prompt du builder IA                 |
| `src/features/agents/creation/personaBuilderSchema.ts`                | 3     | Schema JSON de sortie                |
| `src/features/agents/creation/personaValidatorPrompt.ts`              | 4     | Prompt du validateur                 |
| `src/features/agents/creation/previewPrompts.ts`                      | 5     | Prompts de test par type             |
| `src/app/api/persona-builder/route.ts`                                | 3     | API builder conversationnel          |
| `src/app/api/persona-validator/route.ts`                              | 4     | API validateur de cohérence          |
| `src/app/api/persona-preview/route.ts`                                | 5     | API preview conversation             |

---

## Compteur de progression

| Phase                      | Tâches  | Terminées |
| -------------------------- | ------- | --------- |
| Phase 0 — Fondations       | 22      | 22        |
| Phase 1 — Templates Riches | 23      | 14        |
| Phase 2 — Wizard 5 étapes  | 30      | 30        |
| Phase 3 — Builder IA       | 17      | 17        |
| Phase 4 — Brain Panel      | 21      | 21        |
| Phase 5 — Preview & Tests  | 15      | 15        |
| Phase 6 — Polish           | 42      | 0         |
| **TOTAL**                  | **170** | **119**   |
