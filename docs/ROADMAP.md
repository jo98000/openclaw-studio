# OpenClaw Studio — Roadmap Complète

> Audit complet + plan d'amélioration structuré en 4 phases.
> Généré le 2026-03-01 — basé sur l'analyse de 130+ fichiers, 20+ sources web, et les best practices de l'industrie.

---

## Table des matières

- [Contexte & État actuel](#contexte--état-actuel)
- [Vision](#vision)
- [Phase 1 — Fondations & Registres](#phase-1--fondations--registres)
- [Phase 2 — Connecteurs & Routing](#phase-2--connecteurs--routing)
- [Phase 3 — Analytics & Monitoring](#phase-3--analytics--monitoring)
- [Phase 4 — Fonctionnalités Avancées](#phase-4--fonctionnalités-avancées)
- [Matrice des dépendances](#matrice-des-dépendances)
- [KPIs de succès](#kpis-de-succès)
- [Annexes](#annexes)

---

## Contexte & État actuel

### Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Styling | Tailwind CSS + shadcn/ui | 4.x |
| State | React Context + useReducer | — |
| i18n | next-intl | 4.8.3 |
| Tests unitaires | Vitest | 4.0.18 |
| Tests E2E | Playwright | 1.58.0 |
| WebSocket | ws | 8.18.3 |
| Serveur | Custom Node.js + Next.js | 22 (Alpine) |
| Conteneur | Docker multi-stage | — |
| Reverse proxy | Nginx + Certbot | — |
| Monitoring | OpenTelemetry (@vercel/otel) | 2.1.0 |

### Inventaire actuel

| Domaine | État | Détails |
|---------|------|---------|
| Providers IA | 5/20+ | Anthropic, OpenAI, Perplexity, Google, Mistral + Custom |
| Credentials | 6 templates | SMTP, Twitter, Instagram, GitHub, Slack, Custom |
| Canaux de messagerie | 0 UI | OpenClaw supporte 12+ canaux (WhatsApp, Telegram, Slack, Discord, Teams, etc.) — aucune gestion dans Studio |
| Agent templates | 6 | General, Researcher, Coder, Writer, Multimodal, Custom |
| Tests unitaires | 131 fichiers | 26,566 lignes |
| Tests E2E | 8 fichiers | 245 lignes |
| i18n | 2 langues | EN, FR |
| CI/CD | Aucun | Pas de GitHub Actions |
| Pre-commit | Aucun | Pas de Husky/lint-staged |
| Analytics | Aucun | Pas de dashboard de métriques |
| Routing multi-agent | Aucun | Pas d'UI de gestion |
| Webhooks | Aucun | Pas d'UI de gestion |
| Skills browser | Aucun | Install/Remove sans catalogue |
| Error monitoring | Aucun | Pas de Sentry/GlitchTip |
| Rate limiting | Aucun | APIs exposées sans protection |

### Architecture

```
Browser ──WebSocket──▶ Studio Server ──WS Proxy──▶ OpenClaw Gateway
                      (port 3000)                  (port 18789)
                          │
                     ┌────┴────┐
                     │ Next.js │
                     │ App     │
                     │ Router  │
                     └────┬────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         API Routes   Features    Server
         /api/*       /features   /server
                      /agents     gateway-proxy
                      /providers  access-gate
                      /credentials credential-vault
```

---

## Vision

Transformer OpenClaw Studio d'un tableau de bord basique de gestion d'agents en une **plateforme complète de pilotage d'agents IA** avec :

1. **Support complet de l'écosystème OpenClaw** — Tous les providers, canaux, et skills
2. **Observabilité** — Analytics en temps réel, KPIs, et monitoring
3. **Orchestration** — Routing multi-agent, webhooks, et workflows
4. **Qualité** — CI/CD, tests exhaustifs, error monitoring
5. **Accessibilité** — Mobile-first, multilingue, accessible

---

## Phase 1 — Fondations & Registres

> Objectif : Étendre les registres de providers, credentials, et agents pour couvrir l'écosystème complet d'OpenClaw.

### Sprint 1.1 — Registre de Providers Étendu

**Priorité :** Critique
**Dépendances :** Aucune
**Estimation :** 3 fichiers modifiés

#### Tâches

##### 1.1.1 Étendre le type `ProviderId`

**Fichier :** `src/features/providers/types.ts`

```
État actuel : "anthropic" | "openai" | "perplexity" | "google" | "mistral" | "custom"
```

Ajouter :
- `"groq"` — Groq (inference ultra-rapide, Llama/Mixtral)
- `"openrouter"` — OpenRouter (gateway multi-modèles)
- `"ollama"` — Ollama (local self-hosted)
- `"deepseek"` — DeepSeek (reasoning chinois)
- `"together"` — Together AI (open-source at scale)
- `"fireworks"` — Fireworks AI (fine-tuned inference)
- `"cohere"` — Cohere (enterprise RAG)
- `"amazon-bedrock"` — Amazon Bedrock
- `"azure-openai"` — Azure OpenAI
- `"cloudflare"` — Cloudflare Workers AI
- `"nvidia"` — NVIDIA NIM
- `"huggingface"` — Hugging Face Inference

##### 1.1.2 Ajouter les providers au registre

**Fichier :** `src/features/providers/providerRegistry.ts`

Providers à ajouter avec modèles, context windows, et cost tiers :

| Provider | Modèles principaux | Context | Cost |
|----------|-------------------|---------|------|
| Groq | llama-3.3-70b, mixtral-8x7b, gemma2-9b | 128K | low |
| OpenRouter | routing vers 200+ modèles | variable | variable |
| Ollama | llama3, codellama, mistral (local) | variable | free |
| DeepSeek | deepseek-v3, deepseek-r1 | 128K | low |
| Together AI | meta-llama/Llama-3.3-70B | 128K | low |
| Fireworks AI | accounts/fireworks/llama-v3p3 | 128K | low |
| Cohere | command-r-plus, command-r | 128K | mid |
| Amazon Bedrock | claude-via-bedrock, titan | 200K | mid |
| Azure OpenAI | gpt-4o-via-azure | 128K | mid |
| Cloudflare | @cf/meta/llama-3.3-70b-instruct | 32K | low |
| NVIDIA NIM | meta/llama-3.1-405b | 128K | mid |
| Hugging Face | meta-llama/Llama-3.3-70B | 128K | low |

##### 1.1.3 Améliorer l'UI du ProvidersPanel

**Fichier :** `src/features/providers/components/ProvidersPanel.tsx`

- Ajouter un filtre par catégorie (Commercial / Open-Source / Self-Hosted / Gateway)
- Ajouter une barre de recherche pour trouver un provider
- Ajouter des badges de statut plus détaillés
- Grouper les providers par catégorie dans la grille

---

### Sprint 1.2 — Templates de Credentials Étendus

**Priorité :** Haute
**Dépendances :** Aucune
**Estimation :** 2 fichiers modifiés

#### Tâches

##### 1.2.1 Étendre `CredentialServiceType`

**Fichier :** `src/features/credentials/types.ts`

```
État actuel : "smtp" | "twitter" | "instagram" | "github" | "slack" | "custom"
```

Ajouter :
- Messaging : `"whatsapp"`, `"telegram"`, `"discord"`, `"teams"`, `"mattermost"`, `"signal"`
- Cloud : `"aws"`, `"gcp"`, `"azure"`
- DevTools : `"jira"`, `"linear"`, `"notion"`, `"gitlab"`
- Communication : `"twilio"`, `"sendgrid"`, `"mailgun"`
- Storage : `"supabase"`, `"firebase"`, `"s3"`
- Payment : `"stripe"`
- CRM : `"hubspot"`, `"salesforce"`
- Monitoring : `"datadog"`, `"pagerduty"`, `"sentry"`

##### 1.2.2 Ajouter les templates

**Fichier :** `src/features/credentials/credentialTemplates.ts`

Templates prioritaires avec champs spécifiques :

| Service | Champs | Sensibles |
|---------|--------|-----------|
| WhatsApp | phoneNumberId, accessToken, verifyToken, appSecret | accessToken, appSecret |
| Telegram | botToken | botToken |
| Discord | botToken, applicationId, publicKey | botToken |
| Teams | appId, appPassword, tenantId | appPassword |
| Twilio | accountSid, authToken, phoneNumber | authToken |
| Stripe | secretKey, webhookSecret, publishableKey | secretKey, webhookSecret |
| AWS | accessKeyId, secretAccessKey, region | secretAccessKey |
| Supabase | url, anonKey, serviceRoleKey | serviceRoleKey |
| Notion | integrationToken | integrationToken |
| Linear | apiKey | apiKey |
| SendGrid | apiKey | apiKey |
| Datadog | apiKey, appKey | apiKey, appKey |
| HubSpot | accessToken | accessToken |

---

### Sprint 1.3 — Templates d'Agents Enrichis

**Priorité :** Moyenne
**Dépendances :** Sprint 1.1 (providers étendus)
**Estimation :** 1 fichier modifié

#### Tâches

##### 1.3.1 Ajouter des templates spécialisés

**Fichier :** `src/features/agents/templates/agentTemplates.ts`

```
État actuel : 6 templates (General, Researcher, Coder, Writer, Multimodal, Custom)
```

Templates à ajouter :

| Template | Modèle par défaut | Capabilities | Icône |
|----------|------------------|-------------|-------|
| Customer Support | claude-sonnet | ask, web, files | 🎧 |
| Data Analyst | gpt-4o | auto, web, files | 📊 |
| DevOps Agent | claude-opus | auto, web, files | 🔧 |
| Social Media Manager | gpt-4o | ask, web, files | 📱 |
| Content Strategist | claude-sonnet | off, web, files | 📝 |
| Sales Outreach | claude-sonnet | ask, web, files | 🎯 |
| Personal Assistant | claude-sonnet | ask, web, files | 🗓️ |
| Translation Agent | gpt-4o | off, web, false | 🌍 |

---

### Sprint 1.4 — CI/CD & Quality Gates

**Priorité :** Haute
**Dépendances :** Aucune
**Estimation :** 5 nouveaux fichiers

#### Tâches

##### 1.4.1 GitHub Actions CI Pipeline

**Nouveau fichier :** `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --reporter=verbose

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run e2e

  build:
    runs-on: ubuntu-latest
    needs: [quality]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run build
```

##### 1.4.2 Pre-commit hooks

**Fichier à modifier :** `package.json` — Ajouter devDeps + prepare script

```json
{
  "devDependencies": {
    "husky": "^9",
    "lint-staged": "^15"
  },
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

**Nouveau fichier :** `.husky/pre-commit`

```sh
npx lint-staged
```

##### 1.4.3 Bundle analyzer

**Fichier à modifier :** `package.json` — Ajouter `@next/bundle-analyzer`
**Fichier à modifier :** `next.config.ts` — Wrapper conditionnel

```typescript
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
```

---

### Sprint 1.5 — Modèles mis à jour dans le registre

**Priorité :** Moyenne
**Dépendances :** Sprint 1.1
**Estimation :** 1 fichier modifié

#### Tâches

##### 1.5.1 Mettre à jour les modèles existants

**Fichier :** `src/features/providers/providerRegistry.ts`

| Provider | Modèle à ajouter | Catégorie |
|----------|------------------|-----------|
| Anthropic | claude-opus-4-6, claude-sonnet-4-6 | reasoning, general |
| OpenAI | gpt-4.1, gpt-4.1-mini, o3, o4-mini | general, reasoning |
| Google | gemini-2.5-flash | fast |
| Mistral | mistral-medium-latest, codestral | general, code |

---

### Récapitulatif Phase 1

| Sprint | Fichiers modifiés | Nouveaux fichiers | Priorité |
|--------|-------------------|-------------------|----------|
| 1.1 Providers | 3 | 0 | Critique |
| 1.2 Credentials | 2 | 0 | Haute |
| 1.3 Agent Templates | 1 | 0 | Moyenne |
| 1.4 CI/CD | 2 | 3 | Haute |
| 1.5 Modèles à jour | 1 | 0 | Moyenne |
| **Total Phase 1** | **9** | **3** | |

---

## Phase 2 — Connecteurs & Routing

> Objectif : Donner à Studio la capacité de gérer les canaux de messagerie, le routing multi-agent, et les webhooks.

### Sprint 2.1 — Module Channels (Connecteurs)

**Priorité :** Critique
**Dépendances :** Phase 1 (credentials étendus)
**Estimation :** 8 nouveaux fichiers, 3 modifiés

#### Architecture du module

```
src/features/channels/
├── types.ts                    # ChannelId, ChannelConfig, ChannelStatus
├── channelRegistry.ts          # Registre des 12+ canaux supportés
├── channelApi.ts               # API calls gateway (channels.list, channels.configure)
├── channelStore.ts             # State management (React Context)
└── components/
    ├── ChannelsPanel.tsx        # Panel principal — grille de canaux avec statut
    ├── ChannelCard.tsx          # Carte par canal (icône, nom, statut, actions)
    ├── ChannelConfigModal.tsx   # Modal de configuration par canal
    └── ChannelStatusBadge.tsx   # Badge de statut (connected/disconnected/error)
```

#### Canaux à supporter

| Canal | Icône | Champs de config |
|-------|-------|-----------------|
| WhatsApp | 📱 | phoneNumberId, accessToken, verifyToken |
| Telegram | ✈️ | botToken, webhookUrl |
| Slack | 💼 | botToken, signingSecret, appId |
| Discord | 🎮 | botToken, applicationId, guildId |
| Microsoft Teams | 🏢 | appId, appPassword, tenantId |
| Google Chat | 💬 | serviceAccountKey, spaceId |
| Signal | 🔒 | signalNumber, signalApiUrl |
| iMessage | 🍎 | blueBubblesUrl, blueBubblesPassword |
| Matrix | 🟢 | homeserverUrl, accessToken, userId |
| Zalo | 🇻🇳 | oaId, secretKey, accessToken |
| WebChat | 🌐 | embedUrl, theme, directLineSecret |
| Mattermost | 🔵 | serverUrl, botToken, teamId |

#### Fichiers existants à modifier

- `src/features/agents/components/HeaderBar.tsx` — Ajouter entrée "Channels" dans le menu
- `src/app/page.tsx` — Intégrer ChannelsPanel (dynamic import, ssr: false)
- `messages/en.json` + `messages/fr.json` — Traductions du module channels

---

### Sprint 2.2 — Routing Multi-Agent

**Priorité :** Haute
**Dépendances :** Sprint 2.1 (channels)
**Estimation :** 5 nouveaux fichiers, 2 modifiés

#### Architecture du module

```
src/features/routing/
├── types.ts                    # RoutingRule, RoutingTarget, RoutingCondition
├── routingApi.ts               # Gateway calls (routing.list, routing.set)
├── routingStore.ts             # State management
└── components/
    ├── RoutingPanel.tsx         # Table de règles de routing
    └── RoutingRuleEditor.tsx    # Éditeur de règle (condition → agent)
```

#### Modèle de données

```typescript
type RoutingRule = {
  id: string;
  name: string;
  condition: RoutingCondition;
  targetAgentId: string;
  priority: number;
  enabled: boolean;
};

type RoutingCondition = {
  channel?: ChannelId;          // Route par canal
  account?: string;             // Route par compte/numéro
  peerPattern?: string;         // Route par pattern d'interlocuteur
  keywords?: string[];          // Route par mots-clés
};
```

#### UI

- Table triable par priorité avec drag-and-drop pour réordonner
- Chaque ligne : Condition (canal + filtre) → Agent cible → Toggle enabled
- Bouton "Add Rule" ouvrant le RoutingRuleEditor
- Indicateur de conflits quand plusieurs règles matchent

---

### Sprint 2.3 — Gestion des Webhooks

**Priorité :** Moyenne
**Dépendances :** Aucune
**Estimation :** 5 nouveaux fichiers, 2 modifiés

#### Architecture du module

```
src/features/webhooks/
├── types.ts                    # Webhook, WebhookEvent, WebhookLog
├── webhookApi.ts               # Gateway calls
├── webhookStore.ts             # State management
└── components/
    ├── WebhooksPanel.tsx        # Liste des webhooks configurés
    └── WebhookCreateModal.tsx   # Création/édition de webhook
```

#### Fonctionnalités

- Liste des webhooks avec URL, secret, événements associés
- Création avec sélection d'événements (message.received, agent.completed, cron.executed, etc.)
- Log des invocations récentes (timestamp, status code, payload preview)
- Bouton "Test" pour envoyer un payload de test
- Copie d'URL en un clic

---

### Sprint 2.4 — Navigateur de Skills (ClawHub)

**Priorité :** Haute
**Dépendances :** Aucune
**Estimation :** 5 nouveaux fichiers, 2 modifiés

#### Architecture du module

```
src/features/skills/
├── types.ts                    # Skill, SkillCategory, SkillSearchResult
├── skillsApi.ts                # API calls (skills.search, skills.install)
├── skillsBrowserStore.ts       # State management + cache
└── components/
    ├── SkillsBrowser.tsx        # Navigateur principal avec recherche + catégories
    ├── SkillCard.tsx            # Carte de skill (nom, auteur, description, étoiles)
    └── SkillDetailModal.tsx     # Détails (README, config, reviews)
```

#### Fonctionnalités

- Recherche full-text dans le catalogue ClawHub (13,729+ skills)
- Filtres par catégorie (Productivity, Dev Tools, Social, Communication, etc.)
- Tri par popularité, récence, pertinence
- Aperçu du SKILL.md avec rendered markdown
- Installation en un clic avec progress indicator
- Skills installés mis en avant

---

### Récapitulatif Phase 2

| Sprint | Fichiers modifiés | Nouveaux fichiers | Priorité |
|--------|-------------------|-------------------|----------|
| 2.1 Channels | 3 | 8 | Critique |
| 2.2 Routing | 2 | 5 | Haute |
| 2.3 Webhooks | 2 | 5 | Moyenne |
| 2.4 Skills Browser | 2 | 6 | Haute |
| **Total Phase 2** | **9** | **24** | |

---

## Phase 3 — Analytics & Monitoring

> Objectif : Donner de la visibilité sur les performances, la qualité, et l'activité des agents.

### Sprint 3.1 — Dashboard Analytics

**Priorité :** Haute
**Dépendances :** Aucune
**Estimation :** 7 nouveaux fichiers, 3 modifiés

#### Architecture du module

```
src/features/analytics/
├── types.ts                    # Metric, TimeSeries, AgentMetrics
├── analyticsCollector.ts       # Collecteur de métriques depuis gateway events
├── analyticsStore.ts           # State + agrégation
└── components/
    ├── AnalyticsDashboard.tsx   # Dashboard principal
    ├── MetricCard.tsx           # Carte de métrique (KPI avec trend)
    ├── TimeSeriesChart.tsx      # Graphique temporel (SVG custom ou lightweight lib)
    └── AgentLeaderboard.tsx     # Classement des agents par activité
```

#### KPIs à afficher

| KPI | Source | Visualisation |
|-----|--------|---------------|
| Total conversations (24h/7j/30j) | Gateway events `chat.*` | Number + trend arrow |
| Messages envoyés/reçus | Gateway events `chat.send` | Bar chart |
| Temps de réponse moyen | Event timestamps delta | Number + sparkline |
| Taux d'erreur | Agent status "error" events | Percentage + trend |
| Tokens consommés | Chat completion metadata | Number by provider |
| Agents actifs | Agent status "running" | Number |
| Approbations en attente | Exec approval events | Badge count |
| Uptime par agent | Presence events | Percentage |

#### Collecte des données

- Capturer les métriques en temps réel depuis `runtimeEventBridge.ts`
- Stocker en mémoire avec window de rétention (24h de données granulaires)
- Agréger pour les vues 7j/30j
- Optionnel : persister dans localStorage pour survivre aux refresh

#### Fichiers à modifier

- `src/features/agents/state/runtimeEventBridge.ts` — Émettre les métriques vers le collecteur
- `src/features/agents/components/HeaderBar.tsx` — Ajouter entrée "Analytics"
- `src/app/page.tsx` — Intégrer le dashboard (dynamic import)

---

### Sprint 3.2 — Métriques Inline par Agent

**Priorité :** Moyenne
**Dépendances :** Sprint 3.1
**Estimation :** 2 fichiers modifiés

#### Tâches

##### 3.2.1 Mini-métriques dans FleetSidebar

**Fichier :** `src/features/agents/components/FleetSidebar.tsx`

Afficher sous chaque agent dans la liste :
- Dernier message : "il y a 5 min"
- Messages aujourd'hui : "12 msg"
- Indicateur de santé (point vert/orange/rouge)

##### 3.2.2 Onglet Performance dans AgentInspectPanels

**Fichier :** `src/features/agents/components/AgentInspectPanels.tsx`

Ajouter un mode "performance" dans le panel d'inspection :
- Messages traités (24h/7j/30j)
- Temps de réponse moyen
- Tokens consommés (graphique)
- Taux d'erreur
- Dernières erreurs

---

### Sprint 3.3 — Viewer de Logs

**Priorité :** Moyenne
**Dépendances :** Sprint 3.1
**Estimation :** 4 nouveaux fichiers, 2 modifiés

#### Architecture

```
src/features/logs/
├── types.ts                    # LogEntry, LogLevel, LogFilter
├── logStore.ts                 # Ring buffer de logs en mémoire
└── components/
    ├── LogViewer.tsx            # Viewer principal avec auto-scroll
    └── LogFilterBar.tsx         # Barre de filtres (agent, level, recherche)
```

#### Fonctionnalités

- Capture des logs depuis les events gateway et les console.* du serveur
- Filtrage par : agent, niveau (info/warn/error/debug), texte libre
- Auto-scroll avec pause au scroll manuel
- Badge de compteur dans le menu
- Export en fichier texte

---

### Sprint 3.4 — Error Monitoring (Sentry)

**Priorité :** Haute
**Dépendances :** Aucune
**Estimation :** 4 nouveaux fichiers, 2 modifiés

#### Tâches

##### 3.4.1 Intégration Sentry

**Nouveaux fichiers :**
- `sentry.client.config.ts` — Config client (DSN, environment, traces sample rate)
- `sentry.server.config.ts` — Config server
- `sentry.edge.config.ts` — Config edge (si utilisé)

**Fichiers modifiés :**
- `next.config.ts` — Wrapper `withSentryConfig`
- `src/components/ErrorBoundary.tsx` — `Sentry.captureException()` dans `componentDidCatch`
- `package.json` — Ajouter `@sentry/nextjs`

##### 3.4.2 Alternative open-source : GlitchTip

Si Sentry SaaS n'est pas souhaité, GlitchTip est un drop-in replacement self-hosted compatible avec le SDK Sentry.

---

### Sprint 3.5 — Rate Limiting API

**Priorité :** Haute
**Dépendances :** Aucune
**Estimation :** 1 nouveau fichier, 5 modifiés

#### Tâches

##### 3.5.1 Créer le middleware

**Nouveau fichier :** `src/lib/rateLimit.ts`

```typescript
// Sliding window rate limiter (in-memory)
// Configurable par route : window (ms), max requests
// Headers : X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
// Retourne 429 Too Many Requests quand la limite est atteinte
```

##### 3.5.2 Appliquer sur les routes sensibles

| Route | Limite |
|-------|--------|
| `POST /api/credentials/*` | 30 req/min |
| `PUT /api/studio` | 60 req/min |
| `POST /api/gateway/agent-state` | 20 req/min |
| `POST /api/gateway/skills/remove` | 10 req/min |
| `GET /api/path-suggestions` | 60 req/min |

---

### Récapitulatif Phase 3

| Sprint | Fichiers modifiés | Nouveaux fichiers | Priorité |
|--------|-------------------|-------------------|----------|
| 3.1 Analytics Dashboard | 3 | 7 | Haute |
| 3.2 Métriques Inline | 2 | 0 | Moyenne |
| 3.3 Log Viewer | 2 | 4 | Moyenne |
| 3.4 Error Monitoring | 3 | 3 | Haute |
| 3.5 Rate Limiting | 5 | 1 | Haute |
| **Total Phase 3** | **15** | **15** | |

---

## Phase 4 — Fonctionnalités Avancées

> Objectif : Features différenciantes pour faire de Studio une plateforme de référence.

### Sprint 4.1 — i18n Étendu

**Priorité :** Moyenne
**Dépendances :** Aucune
**Estimation :** 6 nouveaux fichiers, 2 modifiés

#### Langues à ajouter

| Langue | Fichier | Notes |
|--------|---------|-------|
| Espagnol | `messages/es.json` | Marché hispanophone |
| Portugais | `messages/pt.json` | Brésil |
| Allemand | `messages/de.json` | Europe centrale |
| Chinois simplifié | `messages/zh.json` | Marché asiatique |
| Japonais | `messages/ja.json` | Marché asiatique |
| Arabe | `messages/ar.json` | + Support RTL dans globals.css |

**Fichiers modifiés :**
- `src/i18n/request.ts` — Ajouter les locales au tableau
- `src/components/LocaleSwitcher.tsx` — Dropdown au lieu de toggle binaire

---

### Sprint 4.2 — Responsive Mobile Amélioré

**Priorité :** Haute
**Dépendances :** Aucune
**Estimation :** 0 nouveaux fichiers, 6 modifiés

#### Améliorations par fichier

| Fichier | Améliorations |
|---------|--------------|
| `src/app/page.tsx` | Bottom tab bar native, transitions swipe, safe area insets |
| `src/features/agents/components/FleetSidebar.tsx` | Mode drawer/sheet overlay sur mobile, gesture-based dismiss |
| `src/features/agents/components/AgentChatPanel.tsx` | Touch targets 44px min, swipe-to-reply, virtual keyboard handling |
| `src/features/agents/components/AgentInspectPanels.tsx` | Full-screen sheet sur mobile, back button |
| `src/features/agents/components/AgentCreateModal.tsx` | Full-screen sur mobile, bottom sheet style |
| `src/app/globals.css` | Touch targets, safe-area-inset, iOS rubber-band, -webkit-tap |

---

### Sprint 4.3 — Tests E2E Étendus

**Priorité :** Haute
**Dépendances :** Phases 1-2 (nouvelles features)
**Estimation :** 10 nouveaux fichiers

#### Nouveaux tests

| Test | Scénario |
|------|----------|
| `agent-create-wizard.spec.ts` | Flow complet de création d'agent avec templates |
| `agent-chat-send.spec.ts` | Envoi message, affichage réponse, gestion erreur |
| `provider-config.spec.ts` | Configuration d'un provider, toggle, suppression |
| `credentials-vault.spec.ts` | CRUD credentials, champs sensibles, templates |
| `theme-toggle.spec.ts` | Switch dark/light, persistance localStorage |
| `locale-switch.spec.ts` | Switch FR/EN, persistance cookie |
| `mobile-responsive.spec.ts` | Navigation mobile, tab bar, drawer |
| `channels-panel.spec.ts` | Gestion des connecteurs |
| `routing-rules.spec.ts` | CRUD routing rules |
| `skills-browser.spec.ts` | Recherche et installation de skills |

---

### Sprint 4.4 — Canvas Preview (Expérimental)

**Priorité :** Basse
**Dépendances :** Sprint 3.1
**Estimation :** 4 nouveaux fichiers

OpenClaw supporte "Live Canvas" avec A2UI (composants UI interactifs générés par l'agent).

```
src/features/canvas/
├── types.ts                    # CanvasElement, CanvasLayout
├── canvasRenderer.ts           # Renderer d'éléments A2UI
└── components/
    ├── CanvasPreview.tsx        # Fenêtre de preview du canvas
    └── CanvasToggle.tsx         # Toggle dans le chat header
```

---

### Sprint 4.5 — Communication Inter-Agents

**Priorité :** Basse
**Dépendances :** Sprint 2.2 (routing)
**Estimation :** 3 nouveaux fichiers, 1 modifié

Visualiser les messages échangés entre agents :

```
src/features/intercom/
├── types.ts                    # InterAgentMessage
├── intercomStore.ts            # State des messages inter-agents
└── components/
    └── InterAgentFeed.tsx       # Feed de messages entre agents
```

---

### Sprint 4.6 — Intégration Vocale

**Priorité :** Basse
**Dépendances :** Aucune
**Estimation :** 3 nouveaux fichiers, 1 modifié

OpenClaw supporte la synthèse vocale (ElevenLabs) et la reconnaissance vocale :

```
src/features/voice/
├── types.ts                    # VoiceConfig, VoiceProvider
├── voiceStore.ts               # State voice (on/off, provider, voice ID)
└── components/
    └── VoiceControls.tsx        # Contrôles voix dans le chat (mic, speaker, config)
```

**Fichier modifié :** `src/features/agents/components/AgentChatPanel.tsx` — Intégrer VoiceControls

---

### Récapitulatif Phase 4

| Sprint | Fichiers modifiés | Nouveaux fichiers | Priorité |
|--------|-------------------|-------------------|----------|
| 4.1 i18n Étendu | 2 | 6 | Moyenne |
| 4.2 Mobile | 6 | 0 | Haute |
| 4.3 Tests E2E | 0 | 10 | Haute |
| 4.4 Canvas | 0 | 4 | Basse |
| 4.5 Inter-Agent | 1 | 3 | Basse |
| 4.6 Voice | 1 | 3 | Basse |
| **Total Phase 4** | **10** | **26** | |

---

## Matrice des dépendances

```
Phase 1 (Fondations)
├── 1.1 Providers ─────────────────────▶ 1.3 Agent Templates
├── 1.2 Credentials ───────────────────▶ 2.1 Channels
├── 1.4 CI/CD (indépendant)
└── 1.5 Modèles à jour ◀────────────── 1.1 Providers

Phase 2 (Connecteurs)
├── 2.1 Channels ──────────────────────▶ 2.2 Routing
├── 2.3 Webhooks (indépendant)
└── 2.4 Skills Browser (indépendant)

Phase 3 (Analytics)
├── 3.1 Analytics Dashboard ──────────▶ 3.2 Métriques Inline
│                                  └──▶ 3.3 Log Viewer
├── 3.4 Error Monitoring (indépendant)
└── 3.5 Rate Limiting (indépendant)

Phase 4 (Avancé)
├── 4.1 i18n (indépendant)
├── 4.2 Mobile (indépendant)
├── 4.3 Tests E2E ◀───────────────── Phases 1-3
├── 4.4 Canvas ◀───────────────────── 3.1 Analytics
├── 4.5 Inter-Agent ◀─────────────── 2.2 Routing
└── 4.6 Voice (indépendant)
```

### Ordre d'exécution recommandé

Les sprints **indépendants** peuvent être exécutés en parallèle :

```
Semaine 1-2:  1.1 Providers  |  1.2 Credentials  |  1.4 CI/CD
Semaine 3:    1.3 Templates  |  1.5 Modèles      |  3.4 Sentry  |  3.5 Rate Limit
Semaine 4-5:  2.1 Channels   |  2.4 Skills        |  2.3 Webhooks
Semaine 6:    2.2 Routing    |  3.1 Analytics
Semaine 7:    3.2 Inline     |  3.3 Logs          |  4.1 i18n
Semaine 8:    4.2 Mobile     |  4.3 Tests E2E
Semaine 9+:   4.4 Canvas     |  4.5 Inter-Agent   |  4.6 Voice
```

---

## Récapitulatif Global

| Phase | Sprints | Nouveaux fichiers | Fichiers modifiés | Priorité dominante |
|-------|---------|-------------------|-------------------|--------------------|
| **1. Fondations** | 5 | 3 | 9 | Critique/Haute |
| **2. Connecteurs** | 4 | 24 | 9 | Critique/Haute |
| **3. Analytics** | 5 | 15 | 15 | Haute |
| **4. Avancé** | 6 | 26 | 10 | Haute/Moyenne |
| **Total** | **20 sprints** | **68 fichiers** | **43 fichiers** | |

---

## KPIs de succès

### Phase 1

- [ ] **KPI-1:** 17+ providers dans le registre (vs 5 actuels)
- [ ] **KPI-2:** 20+ templates de credentials (vs 6 actuels)
- [ ] **KPI-3:** 14+ templates d'agents (vs 6 actuels)
- [ ] **KPI-4:** Pipeline CI vert sur chaque PR
- [ ] **KPI-5:** Pre-commit hooks actifs (lint + format)

### Phase 2

- [ ] **KPI-6:** 12 canaux de messagerie gérables depuis l'UI
- [ ] **KPI-7:** Routing multi-agent configurable avec drag-and-drop
- [ ] **KPI-8:** Webhooks créables/testables depuis l'UI
- [ ] **KPI-9:** Catalogue ClawHub navigable avec recherche

### Phase 3

- [ ] **KPI-10:** Dashboard analytics avec 8+ KPIs en temps réel
- [ ] **KPI-11:** Métriques inline par agent dans la sidebar
- [ ] **KPI-12:** Log viewer filtrable en temps réel
- [ ] **KPI-13:** Error monitoring actif (Sentry ou équivalent)
- [ ] **KPI-14:** Rate limiting sur toutes les routes API sensibles

### Phase 4

- [ ] **KPI-15:** 8+ langues supportées
- [ ] **KPI-16:** Score Lighthouse mobile > 90
- [ ] **KPI-17:** 18+ tests E2E (vs 8 actuels)
- [ ] **KPI-18:** Canvas preview fonctionnel (expérimental)

---

## Annexes

### A. Providers supportés par OpenClaw (référence)

| Provider | Type | Modèles | Dans Studio |
|----------|------|---------|-------------|
| Anthropic | Commercial | Claude 4.x | Oui |
| OpenAI | Commercial | GPT-4o, o1, o3 | Oui |
| Perplexity | Commercial | Sonar Pro | Oui |
| Google | Commercial | Gemini 2.x | Oui |
| Mistral | Commercial | Large, Small | Oui |
| Groq | Commercial | Llama, Mixtral | Non |
| OpenRouter | Gateway | 200+ modèles | Non |
| Ollama | Self-hosted | Local models | Non |
| DeepSeek | Commercial | V3, R1 | Non |
| Together AI | Commercial | Open-source | Non |
| Fireworks AI | Commercial | Fine-tuned | Non |
| Cohere | Commercial | Command-R | Non |
| Amazon Bedrock | Cloud | Claude, Titan | Non |
| Azure OpenAI | Cloud | GPT-4o | Non |
| Cloudflare | Edge | Llama, Mistral | Non |
| NVIDIA NIM | Commercial | Llama 405B | Non |
| Hugging Face | Open | Inference API | Non |
| LiteLLM | Gateway | Multi-provider | Non |
| Qwen | Commercial | Qwen 2.5 | Non |
| Moonshot/Kimi | Commercial | Kimi | Non |
| Custom | Self-hosted | OpenAI-compat | Oui |

### B. Canaux supportés par OpenClaw (référence)

| Canal | Protocole | Dans Studio |
|-------|-----------|-------------|
| WhatsApp | Cloud API / Business API | Non |
| Telegram | Bot API (long-polling/webhook) | Non |
| Slack | Events API + Web API | Non |
| Discord | Gateway API + REST | Non |
| Microsoft Teams | Bot Framework | Non |
| Google Chat | Chat API | Non |
| Signal | Signal CLI / API | Non |
| iMessage | BlueBubbles bridge | Non |
| Matrix | Client-Server API | Non |
| Zalo | Official API | Non |
| WebChat | DirectLine / Embed | Non |
| Mattermost | Bot API | Non |

### C. Sources de l'audit

1. Analyse du codebase : 130+ fichiers TypeScript/TSX
2. OpenClaw Documentation : docs.openclaw.ai
3. GitHub OpenClaw : 191,000+ stars, 900+ contributeurs
4. ClawHub Skills Registry : 13,729+ skills
5. Industry best practices : Botpress, Voiceflow, Dialogflow comparisons
6. Security research : CrowdStrike, Snyk analyses
7. Agent observability : Langfuse, LangSmith, AgentOps benchmarks
